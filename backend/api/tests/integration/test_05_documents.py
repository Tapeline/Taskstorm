from unittest import skip

from rest_framework.test import APITestCase

from api.tests.utils import Dummy, Schema


@skip("Didn't figure how to test websockets yet")
class APIDocumentsTestCase(APITestCase):
    def setUp(self):
        self.user = Dummy.user()

    def test_collab_editing(self):
        pass

