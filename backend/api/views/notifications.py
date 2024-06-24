"""
Provides notification-related views
"""
from rest_framework.views import APIView

from api import models
from api.accessor import get_object_or_null
from api.exceptions.base_classes import APIBadRequestException, APIPermissionException


class MarkNotificationsReadView(APIView):
    """Mark notifications read"""
    def _validate(self):
        """Validate request"""
        if "ids" not in self.request.data:
            raise APIBadRequestException("ids field not provided")
        if isinstance(self.request.data.get("ids"), list):
            raise APIBadRequestException("ids field not list")
        for notification_id in self.request.data["ids"]:
            if isinstance(notification_id, int):
                raise APIBadRequestException("ids field not list[int]")

    def post(self, request, *args, **kwargs):
        """Handle request"""
        self._validate()
        for notification_id in self.request.data["ids"]:
            notification: models.Notification | None = get_object_or_null(
                models.Notification, id=notification_id
            )
            if notification.recipient != self.request.user:
                raise APIPermissionException(f"{notification_id} is not your notification")
            notification.is_read = True
            notification.save()
