"""
Provides ways to create dummy objects in DB
"""

from api.models import User, Workspace, Task, WorkflowStage


class Dummy:
    """Dummy object creator"""
    PASSWORD = "aaAA00"

    @staticmethod
    def user(username: str = "dummy") -> User:
        """Create dummy user"""
        return User.objects.create_user(
            username=username,
            password=Dummy.PASSWORD
        )

    @staticmethod
    def workspace(user: User, name: str = "dummy workspace") -> Workspace:
        """Create dummy workspace"""
        return Workspace.objects.create(
            owner=user,
            name=name,
            is_drafted=False
        )

    @staticmethod
    def task(user: User, workspace: Workspace, name: str = "dummy task",
             description: str = "dummy task", **kwargs) -> Task:
        """Create dummy task"""
        return Task.objects.create(
            creator=user,
            workspace=workspace,
            name=name,
            description=description,
            is_drafted=False,
            **kwargs
        )

    @staticmethod
    def stage(workspace: Workspace, name: str = "dummy stage",
              is_end: bool = False) -> WorkflowStage:
        """Create dummy workflow stage"""
        return WorkflowStage.objects.create(
            workspace=workspace,
            name=name,
            color="000000",
            is_end=is_end,
            is_drafted=False
        )
