"""
Test notifications:
    - 1 rule => 1 notification
    - 2 rules => 2 notifications
    - rescheduling after notified => another notification
"""
# pylint: disable=missing-function-docstring

from datetime import timedelta
from time import sleep
from typing import Callable

from django.utils import timezone

from api import models
from api.tasks import check_and_send_notifications
from api.tests.utils.dummy import Dummy
from api.tests.utils.classes import AuthMixin, CeleryTestCase
from taskstorm import celery


class APINotificationsTestCase(CeleryTestCase, AuthMixin):
    """Test notification logic"""
    def setUp(self):
        self.user = Dummy.user()
        self.workspace = Dummy.workspace(self.user)
        self.set_user(self.user.username, Dummy.PASSWORD)

    @property
    def celery_app(self):
        return celery.app

    @staticmethod
    def _try_repeatedly_with_timeout(callback: Callable[[], bool],
                                     timeout: timedelta, sleep_sec: int = 5) -> bool:
        """
        Tries to perform a check.
        If it fails, wait sleep_sec and try again.
        Limited with timeout
        """
        end = timezone.now() + timeout
        print(f"Trying callback. End at: {end}")
        while timezone.now() <= end:
            result = callback()
            if result:
                print("Succeeded")
                return True
            print(f"Failed => sleeping {sleep_sec}")
            sleep(sleep_sec)
        print("Timeout!")
        return False

    def _check_notifications_arrived(self, task_name: str, count: int) -> bool:
        """
        Checks that there are notifications that contain given task name
        and that their count is equal to given count
        """
        response = self.client.get(
            "/api/profile/notifications/?only_unread=true&limit=-1",
            format="json"
        )
        print(*(x["issue_time"] for x in response.data))
        return [task_name in x["message"] for x in response.data].count(True) == count

    def test_single_notify(self):
        task = Dummy.task(self.user, self.workspace, name="TEST_NOTIFICATION_TASK1")
        models.NotificationRule.objects.create(
            workspace=self.workspace,
            applicable_filter="@my",
            time_delta="-00:00"
        )
        task.arrangement_start = timezone.now()
        task.save()
        check_and_send_notifications.delay()
        self.assertTrue(self._try_repeatedly_with_timeout(
            lambda: self._check_notifications_arrived(task.name, 1),
            timedelta(seconds=90)
        ))

    def test_multiple_notify(self):
        task = Dummy.task(self.user, self.workspace, name="TEST_NOTIFICATION_TASK2")
        models.NotificationRule.objects.create(
            workspace=self.workspace,
            applicable_filter="@my",
            time_delta="-00:00"
        )
        models.NotificationRule.objects.create(
            workspace=self.workspace,
            applicable_filter="@my",
            time_delta="-00:01"
        )
        task.arrangement_start = timezone.now()
        task.save()
        check_and_send_notifications.delay()
        self.assertTrue(self._try_repeatedly_with_timeout(
            lambda: self._check_notifications_arrived(task.name, 2),
            timedelta(seconds=90)
        ))

    def test_reschedule_task_after_notification(self):
        task = Dummy.task(self.user, self.workspace, name="TEST_NOTIFICATION_TASK3")
        models.NotificationRule.objects.create(
            workspace=self.workspace,
            applicable_filter="@my",
            time_delta="-00:00"
        )
        task.arrangement_start = timezone.now()
        task.save()
        check_and_send_notifications.delay()
        sleep(10)  # Wait for task to finish
        self.client.patch(f"/api/workspaces/{self.workspace.id}/tasks/{task.id}/", {
            "arrangement_start": timezone.now().isoformat()
        })
        check_and_send_notifications.delay()
        # Now there should be 2 notifications: one before rescheduling and one after
        self.assertTrue(self._try_repeatedly_with_timeout(
            lambda: self._check_notifications_arrived(task.name, 2),
            timedelta(seconds=90)
        ))
