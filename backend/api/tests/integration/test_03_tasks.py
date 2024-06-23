"""
Tests custom business logic (any apart from CRUD) of tasks:
    - closing behaviour, more specifically:
        - closing unstaged
        - closing staged, not completed
        - closing staged, completed
        - auto-closing
    - filtering
"""
# pylint: disable=missing-function-docstring

from rest_framework.test import APITestCase

from api.tests.utils.classes import AuthMixin
from api.tests.utils.dummy import Dummy


class APITasksTestCase(APITestCase, AuthMixin):
    """Test tasks closing logic"""
    def setUp(self):
        self.user = Dummy.user()
        self.workspace = Dummy.workspace(self.user)
        self.set_user(self.user.username, Dummy.PASSWORD)

    def test_try_close_unstaged_task(self):
        task = Dummy.task(self.user, self.workspace)
        response = self.client.patch(f"/api/workspaces/{self.workspace.id}/tasks/{task.id}/", {
            "is_open": False
        }, format="json")
        self.assertEqual(response.status_code, 200)

    def test_try_close_not_complete_task(self):
        task = Dummy.task(self.user, self.workspace)
        stage = Dummy.stage(self.workspace)
        task.stage = stage
        task.save()
        response = self.client.patch(f"/api/workspaces/{self.workspace.id}/tasks/{task.id}/", {
            "is_open": False
        }, format="json")
        self.assertEqual(response.status_code, 409)

    def test_try_close_complete_task(self):
        task = Dummy.task(self.user, self.workspace)
        stage = Dummy.stage(self.workspace, is_end=True)
        task.stage = stage
        task.save()
        response = self.client.patch(f"/api/workspaces/{self.workspace.id}/tasks/{task.id}/", {
            "is_open": False
        }, format="json")
        self.assertEqual(response.status_code, 200)

    def test_task_auto_close(self):
        task = Dummy.task(self.user, self.workspace)
        stage = Dummy.stage(self.workspace, is_end=True)
        self.client.patch(f"/api/workspaces/{self.workspace.id}/tasks/{task.id}/", {
            "stage": stage.id
        })
        response = self.client.get(
            f"/api/workspaces/{self.workspace.id}/tasks/{task.id}/", format="json"
        )
        self.assertEqual(response.data["is_open"], False)


class APITasksFilterTestCase(APITestCase, AuthMixin):
    """Test tasks filter logic"""
    def setUp(self):
        self.user = Dummy.user("user")
        self.workspace = Dummy.workspace(self.user)
        stage = Dummy.stage(self.workspace, name="S")
        Dummy.task(self.user, self.workspace,
                   name="A",
                   folder="X",
                   stage=stage,
                   tags="M")
        Dummy.task(self.user, self.workspace,
                   name="B",
                   assignee=self.user,
                   folder="X",
                   tags="N M")
        Dummy.task(self.user, self.workspace,
                   name="C",
                   assignee=self.user,
                   folder="Y",
                   tags="N M")
        Dummy.task(self.user, self.workspace,
                   name="D",
                   is_open=False,
                   folder="Y",
                   stage=stage,
                   tags="N")
        Dummy.task(self.user, self.workspace,
                   name="E",
                   is_open=False,
                   folder="Y",
                   stage=stage)
        self.set_user(self.user.username, Dummy.PASSWORD)

    def _get_task_names(self, filter_rule: str) -> set[str]:
        """Get task names by filter"""
        response = self.client.get(
            f"/api/workspaces/{self.workspace.id}/tasks/?filters={filter_rule}"
        )
        return set(x["name"] for x in response.data)

    def test_filter_assignee(self):
        self.assertEqual(
            self._get_task_names("@assignee == user"),
            {"B", "C"}
        )
        self.assertEqual(
            self._get_task_names("@assignee == -"),
            {"A", "D", "E"}
        )
        self.assertEqual(
            self._get_task_names("@assigned"),
            {"B", "C"}
        )
        self.assertEqual(
            self._get_task_names("@unassigned"),
            {"A", "D", "E"}
        )

    def test_filter_folder(self):
        self.assertEqual(
            self._get_task_names("@folder == X"),
            {"A", "B"}
        )
        self.assertEqual(
            self._get_task_names("@folder == Y"),
            {"C", "D", "E"}
        )

    def test_filter_creator(self):
        self.assertEqual(
            self._get_task_names("@creator == user"),
            {"A", "B", "C", "D", "E"}
        )

    def test_filter_stage(self):
        self.assertEqual(
            self._get_task_names("@stage == -"),
            {"B", "C"}
        )
        self.assertEqual(
            self._get_task_names("@stage == S"),
            {"A", "D", "E"}
        )
        self.assertEqual(
            self._get_task_names("@unstaged"),
            {"B", "C"}
        )

    def test_filter_tag(self):
        self.assertEqual(
            self._get_task_names("@tag == N"),
            {"B", "C", "D"}
        )
        self.assertEqual(
            self._get_task_names("@tag == M"),
            {"A", "B", "C"}
        )

    def test_filter_open_closed(self):
        self.assertEqual(
            self._get_task_names("@open"),
            {"A", "B", "C"}
        )
        self.assertEqual(
            self._get_task_names("@closed"),
            {"D", "E"}
        )
