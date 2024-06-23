"""
Provides notificator
"""

import logging

from pywebpush import webpush, WebPushException

from taskstorm import settings


def notify(task, user) -> None:
    """Notify user w/ all possible methods"""

    # pylint: disable=import-outside-toplevel
    from api.models import Notification

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
        except WebPushException as wpe:
            logging.error(f"Error sending webpush: %s", wpe)
