"""
Provides helper functionality for notifications
"""

from django.db.models import QuerySet


class NotificationReaderMixin:
    """Provides method to read all notifications if so specified in request"""
    def mark_read_if_needed(self, request, qs: QuerySet) -> None:
        # pylint: disable=missing-function-docstring
        if request.GET.get("mark_read") is not None:
            for notification in qs:
                notification.is_read = True
                notification.save()
