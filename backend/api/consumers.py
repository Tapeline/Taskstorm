"""
Managing websocket connections
"""

import json
import logging

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.authentication import JWTAuthentication

from api.accessor import filter_confirmed
from api.models import Document, User


@sync_to_async
def get_user(token) -> User:
    """Get authenticated user via provided token"""

    auth = JWTAuthentication()
    return auth.get_user(auth.get_validated_token(token))


class EditorConsumer(AsyncWebsocketConsumer):
    """Managing websocket connections for collaborative document editing"""
    DOCUMENTS = {}

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = None
        self.room_group_name = None
        self.logger = logging.Logger(name=f"EditorConsumer-{id(self)}")
        self.logger.info("Editor websocket consumer instantiated")

    async def connect(self):
        self.logger.info("Connecting to %s", self.room_name)
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'editor_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, code):
        self.logger.info("Disconnecting from %s", self.room_name)
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    def save_document(self, doc_id: int, data: dict, user: User) -> None:
        """Tries to save document as given user"""
        if not filter_confirmed(Document, id=doc_id).exists():
            self.logger.info("user %s: No such document %s", user.username, doc_id)
            return
        doc = Document.objects.get(id=doc_id)
        if doc.workspace.owner == user or user in doc.workspace.members.all():
            self.logger.info("user %s: saving document %s", user.username, doc_id)
            doc.data = data
            doc.save()

    def get_document(self, doc_id: int, user: User) -> dict:
        """Tries to get ocument as given user"""

        if not filter_confirmed(Document, id=doc_id).exists():
            self.logger.info("user %s: No such document %s", user.username, doc_id)
            return {}
        doc = Document.objects.get(id=doc_id)
        if doc.workspace.owner == user or user in doc.workspace.members.all():
            self.logger.info("user %s: getting document %s", user.username, doc_id)
            return doc.data
        return {}

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        user = await get_user(data["token"])
        del data["token"]
        if data["command"] == "save-document":
            await sync_to_async(self.save_document)(int(data["documentId"]), data["data"], user)
        elif data["command"] == "get-document":
            data = await sync_to_async(self.get_document)(int(data["documentId"]), user)
            await self.send(json.dumps({"command": "load-document", "data": data}))
        elif data["command"] == "send-changes":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'editor_message',
                    'json_data': {
                        "command": "receive-changes",
                        "delta": data["delta"],
                        "documentId": data["documentId"],
                        "issuer": data["issuer"]
                    }
                }
            )
        elif data["command"].startswith("notify"):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'editor_message',
                    'json_data': data
                }
            )

    async def editor_message(self, event) -> None:
        """Message sender"""

        if "json_data" in event:
            await self.send(json.dumps(event["json_data"]))
            return

        bytes_data = event['bytes_data']
        await self.send(bytes_data=bytes_data)
