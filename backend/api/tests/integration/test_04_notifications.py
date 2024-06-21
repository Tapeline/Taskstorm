from datetime import timedelta
from time import sleep
from typing import Callable
from unittest import skip

from django.utils import timezone
from rest_framework.test import APITestCase

from api import models
from api.tests.utils import Dummy, AuthMixin


@skip("Didn't figure how to start celery beat and worker yet")
class APINotificationsTestCase(APITestCase, AuthMixin):
    def setUp(self):
        self.user = Dummy.user()
        self.workspace = Dummy.workspace(self.user)
        self.set_user(self.user.username, Dummy.PASSWORD)

    @staticmethod
    def _try_repeatedly_with_timeout(callback: Callable[[], bool],
                                     timeout: timedelta, sleep_sec: int = 5):
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

    def _check_notifications_arrived(self, task_name, count):
        response = self.client.get("/api/profile/notifications/?only_unread=true&limit=-1", format="json")
        print(response.data)
        return [task_name in x.message for x in response.data].count(True) == count

    def test_single_notify(self):
        task = Dummy.task(self.user, self.workspace, name="TEST_NOTIFICATION_TASK")
        models.NotificationRule.objects.create(
            workspace=self.workspace,
            applicable_filter="@my",
            time_delta="-00:00"
        )
        task.arrangement_start = timezone.now()
        self.assertTrue(self._try_repeatedly_with_timeout(
            lambda: self._check_notifications_arrived(task.name, 1),
            timedelta(seconds=90)
        ))

    def test_multiple_notify(self):
        task = Dummy.task(self.user, self.workspace, name="TEST_NOTIFICATION_TASK")
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
        task.arrangement_start = timezone.now() + timedelta(seconds=90)
        sleep(90)
        self.assertTrue(self._try_repeatedly_with_timeout(
            lambda: self._check_notifications_arrived(task.name, 2),
            timedelta(seconds=90)
        ))

    def test_reschedule_task_after_notification(self):
        task = Dummy.task(self.user, self.workspace, name="TEST_NOTIFICATION_TASK")
        models.NotificationRule.objects.create(
            workspace=self.workspace,
            applicable_filter="@my",
            time_delta="-00:00"
        )
        task.arrangement_start = timezone.now() + timedelta(seconds=30)
        sleep(50)
        task.arrangement_start = timezone.now() + timedelta(seconds=30)
        sleep(30)
        # Now there should be 2 notifications: one before rescheduling and one after
        self.assertTrue(self._try_repeatedly_with_timeout(
            lambda: self._check_notifications_arrived(task.name, 2),
            timedelta(seconds=90)
        ))

