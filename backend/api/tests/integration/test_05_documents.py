"""
Test real-time document editing
"""
# pylint: disable=missing-function-docstring
# pylint: disable=missing-class-docstring

from unittest import skip

from rest_framework.test import APITestCase

from api.tests.utils.dummy import Dummy


@skip("Didn't figure how to test websockets yet")
class APIDocumentsTestCase(APITestCase):
    def setUp(self):
        self.user = Dummy.user()

    def test_collab_editing(self):
        pass
