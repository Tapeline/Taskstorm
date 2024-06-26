"""
Provides notification-related views
"""
from typing import Literal

from rest_framework.views import APIView

from api import models
from api.accessor import get_object_or_null
from api.cache.notifications import NotificationCache
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


class NotificationCacheMixin:
    """Provides way of interacting with notification cache"""
    notification_cache_key: Literal["workspace"] | Literal["profile"]

    def list(self, request, *args, **kwargs):
        """Override DRF list method from ListModelMixin"""
        username = request.user.username
        if NotificationCache.has_in_cache(username, self.notification_cache_key):
            NotificationCache.logger.info("Using cached response for %s", username)
            return NotificationCache.get_response_from_cache(
                username, self.notification_cache_key
            )
        response = super().list(request, *args, **kwargs)
        NotificationCache.logger.info("Caching response for %s", username)
        NotificationCache.cache_response(
            username, response, self.notification_cache_key
        )
        return response
