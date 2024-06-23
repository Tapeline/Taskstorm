"""
Provides utility classes for convenient testing
"""

from celery.contrib.testing import worker
from rest_framework.test import APITransactionTestCase
from django.test import Client
from kombu.asynchronous.hub import set_event_loop

from api.tests.utils.schema import Schema


class AuthMixin:
    """Mixin for authenticating requests with default DRF client"""
    client: Client

    def __init__(self):
        self._token = None

    def set_user(self, username: str, password: str) -> None:
        """Try to log in using given credentials and then save JWT"""
        response = self.client.post("/api/auth/login/", {
            "username": username,
            "password": password
        }, format="json")
        assert response.status_code == 200
        assert "token" in response.data
        self._token = response.data["token"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self._token}")


class SchemaNotMatchedException(ValueError):
    """Thrown when schema is not matched"""
    def __init__(self, actual, expected):
        super().__init__(f"Schema mismatch:\n"
                         f"Expected: {expected}\n"
                         f"But got: {actual}")


class SchemaCheckerMixin:
    """Provides a method for asserting conformity to schema"""
    def assert_schema(self, actual: dict, expected: dict, strict_match=False) -> None:
        """
        Try to assert conformity to given schema
        :param actual: data dict
        :param expected: schema dict
        :param strict_match: if False, then fields that are present in data, but
                             not present in schema will not be counted as errors
        """
        valid = Schema.conforms_to_schema(actual, expected, ignore_len=not strict_match)
        if not valid:
            raise SchemaNotMatchedException(actual, expected)


class CeleryTestCase(APITransactionTestCase):
    """TestCase class that starts a Celery worker"""
    @property
    def celery_app(self):
        """Get the target Celery app"""
        raise NotImplementedError()

    def run(self, result=None):
        set_event_loop(None)
        self.celery_app.loader.import_module('celery.contrib.testing.tasks')

        with worker.start_worker(self.celery_app, loglevel="debug"):
            super().run(result)
