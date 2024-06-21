from rest_framework.test import APITestCase

from api.tests.utils import Dummy, SchemaCheckerMixin, AuthMixin


class APIWorkspaceTestCase(APITestCase, AuthMixin, SchemaCheckerMixin):
    def setUp(self):
        self.user1 = Dummy.user("user1")
        self.user2 = Dummy.user("user2")
        self.workspace = Dummy.workspace(self.user1)
        self.workspace.members.add(self.user2)
        self.workspace.save()
        self.set_user("user1", Dummy.PASSWORD)

    def test_change_owner_of_workspace(self):
        self.client.patch(f"/api/workspaces/{self.workspace.id}/", {
            "owner": self.user2.id
        }, format="json")
        response = self.client.get(f"/api/workspaces/{self.workspace.id}/", format="json")
        self.assert_schema(
            response.data,
            {
                "owner": {
                    "id": self.user2.id
                },
                "members": [{"id": self.user1.id}]
            }
        )
