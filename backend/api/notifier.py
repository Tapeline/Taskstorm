"""
Provides notificator
"""

import logging

from pywebpush import webpush, WebPushException

from taskstorm import settings


def notify(task, user) -> None:
    """Notify user w/ all possible methods"""
    logging.info("Notifying user %s about task %s", user.username, task.name)

    # pylint: disable=import-outside-toplevel
    from api.models import Notification
    from api.cache.notifications import NotificationCache

    Notification.objects.create(
        workspace=task.workspace,
        recipient=user,
        message=f"{task.name} is about to start: {task.arrangement_start}",
        data={"task": str(task.__dict__)}
    )

    if user.settings["wp_sub"] is not None:
        try:
            webpush(
                subscription_info=user.settings["wp_sub"],
                data=f"{task.name} is about to start: {task.arrangement_start}",
                vapid_private_key=settings.VAPID_PRIVATE,
                vapid_claims={"sub": "mailto:mail@example.com"}
            )
            logging.info("Successfully sent webpush to %s", user.username)
        except WebPushException as wpe:
            logging.error(f"Error sending webpush: %s", wpe)

    NotificationCache.invalidate_for_user(user.username)
