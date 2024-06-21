from rest_framework.test import APITestCase

from api.tests.utils import Schema, SchemaCheckerMixin


class APIRegisterTestCase(APITestCase, SchemaCheckerMixin):
    def test_register(self):
        response = self.client.post("/api/auth/register/", {
            "username": "testUser",
            "password": "aaAA00"
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assert_schema(
            response.data,
            {
                "id": int,
                "username": "testUser",
            }
        )


class APILoginTestCase(APITestCase, SchemaCheckerMixin):
    def test_login(self):
        self.client.post("/api/auth/register/", {
            "username": "testUser",
            "password": "aaAA00"
        }, format="json")
        response = self.client.post("/api/auth/login/", {
            "username": "testUser",
            "password": "aaAA00"
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assert_schema(
            response.data,
            {"token": str}
        )

    def test_invalid_login(self):
        response = self.client.post("/api/auth/login/", {
            "username": "non-existent",
            "password": "non-existent"
        }, format="json")
        self.assertEqual(response.status_code, 401)
        self.assert_schema(
            response.data,
            {"error_message": str}
        )
