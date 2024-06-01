import json

from channels.generic.websocket import AsyncWebsocketConsumer, WebsocketConsumer


class EditorConsumer(AsyncWebsocketConsumer):
    DOCUMENTS = {}

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_name = None
        self.room_group_name = None

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'editor_%s' % self.room_name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        if data["command"] == "save-document":
            self.DOCUMENTS[data["documentId"]] = data["data"]
        elif data["command"] == "get-document":
            doc = self.DOCUMENTS.get(data["documentId"]) or {"ops": None}
            await self.send(json.dumps({"command": "load-document", "data": doc}))
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

    async def editor_message(self, event):
        if "json_data" in event:
            print("sending", event["json_data"])
            await self.send(json.dumps(event["json_data"]))
            return

        bytes_data = event['bytes_data']

        # Send message to WebSocket
        await self.send(bytes_data=bytes_data)
