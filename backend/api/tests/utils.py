from collections import OrderedDict


class Schema:
    class Optional:
        def __init__(self, value):
            self.value = value

    @staticmethod
    def _check_field(actual, expected, ignore_len=False):
        if type(expected) is type:
            return isinstance(actual, expected)
        if isinstance(actual, Schema.Optional):
            actual = actual.value
        if isinstance(expected, dict):
            return Schema.conforms_to_schema(actual, expected, ignore_len)
        if isinstance(expected, list):
            if not isinstance(actual, list):
                return False
            if len(actual) != len(expected):
                return False
            return all(Schema._check_field(a, b, ignore_len) for a, b in zip(actual, expected))
        return actual == expected

    @staticmethod
    def conforms_to_schema(data: dict, schema: dict, ignore_len=True) -> False:
        if len(data) != len(schema) and not ignore_len:
            return False
        if not isinstance(data, dict):
            return False
        for k, v in schema.items():
            if k not in data:
                if isinstance(v, Schema.Optional):
                    continue
                else:
                    return False
            if not Schema._check_field(data[k], v, ignore_len):
                return False
        return True


class Dummy:
    PASSWORD = "aaAA00"

    @staticmethod
    def user(username="dummy"):
        from api.models import User
        return User.objects.create_user(
            username=username,
            password=Dummy.PASSWORD
        )

    @staticmethod
    def workspace(user, name="dummy workspace"):
        from api.models import Workspace
        return Workspace.objects.create(
            owner=user,
            name=name
        )

    @staticmethod
    def task(user, workspace, name="dummy task", description="dummy task", **kwargs):
        from api.models import Task
        return Task.objects.create(
            creator=user,
            workspace=workspace,
            name=name,
            description=description,
            **kwargs
        )

    @staticmethod
    def stage(workspace, name="dummy stage", is_end=False):
        from api.models import WorkflowStage
        return WorkflowStage.objects.create(
            workspace=workspace,
            name=name,
            color="000000",
            is_end=is_end
        )


class AuthMixin:
    from django.test import Client
    client: Client

    def __init__(self):
        self._token = None

    def set_user(self, username, password):
        response = self.client.post("/api/auth/login/", {
            "username": username,
            "password": password
        }, format="json")
        assert response.status_code == 200
        assert "token" in response.data
        self._token = response.data["token"]
        self.client.credentials(HTTP_AUTHORIZATION = f"Bearer {self._token}")


class SchemaNotMatchedException(ValueError):
    def __init__(self, actual, expected):
        super().__init__(f"Schema mismatch:\n"
                         f"Expected: {expected}\n"
                         f"But got: {actual}")


class SchemaCheckerMixin:
    def assert_schema(self, actual: dict, expected: dict, strict_match=False):
        valid = Schema.conforms_to_schema(actual, expected, ignore_len=not strict_match)
        if not valid:
            raise SchemaNotMatchedException(actual, expected)
