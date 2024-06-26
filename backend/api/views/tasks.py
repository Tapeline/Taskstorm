"""
Task-related views and utils
"""
# pylint: disable=too-many-ancestors

from typing import Type

from django.db.models import Model
from rest_framework.generics import (ListCreateAPIView,
                                     RetrieveUpdateDestroyAPIView,
                                     get_object_or_404)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer
from rest_framework.views import APIView

from api import serializers, models, permissions
from api.accessor import get_object_or_null, filter_confirmed
from api.exceptions.exception_classes import TaskClosedButNotAtEndException, \
    TaskAndStageAreInDifferentWorkspacesException
from api.filtering.parser import FilterSyntaxError
from api.views.utils.idempotency import IdempotentCreationModelQuerySetProviderMixin
from api.views.utils.pagination import LimitOffsetPaginationMixin
from api.views.workspace import WorkspaceMixin
from api.filtering import filters, parser as filter_parser


class TaskMixin(WorkspaceMixin):
    """Provides method to get current task"""
    def get_task(self):
        """
        Get current task from url kwarg:
        /api/workspaces/.../tasks/<int:task_id>/...
        """
        return get_object_or_null(models.Task, id=self.kwargs.get("task_id"))


def _validate_closing_status(task_is_open: bool,
                             stage_object: models.WorkflowStage) -> None:
    """
    Make sure that tasks with workflow stage without `is_end` flag
    cannot be closed
    """
    if stage_object is None:
        return
    if not task_is_open and (not stage_object.is_end):
        raise TaskClosedButNotAtEndException


def _assert_stage_belongs_to_same_workspace(task_workspace: models.Workspace,
                                            stage_object: models.WorkflowStage):
    """
    Validate that target workflow stage and task are from
    the same workspace
    """
    if stage_object.workspace != task_workspace:
        raise TaskAndStageAreInDifferentWorkspacesException


class ListCreateTaskView(IdempotentCreationModelQuerySetProviderMixin,
                         ListCreateAPIView, WorkspaceMixin,
                         LimitOffsetPaginationMixin):
    # pylint: disable=missing-class-docstring
    serializer_class = serializers.TaskUnwrappedSerializer
    queryset = models.Task.objects.order_by("-is_open", "-created_at")
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        """Get tasks based on filter (if given)"""

        filter_string = self.get_filters()
        qs = super().get_queryset().filter(workspace=self.get_workspace())
        if filter_string is not None:
            try:
                filter_rule = filter_parser.parse_filter_expression(filter_string)
            except FilterSyntaxError:
                return qs
            id_list = [obj.id for obj in qs.all()
                       if filters.applies_to_filter(obj, self.request.user, filter_rule)]
            qs = qs.filter(id__in=id_list)
        return self.cut_by_pagination(qs)

    def get_filters(self) -> str:
        """Get filters from query param"""
        return self.request.GET.get("filters")

    def _validate_request(self, request):
        """Perform validation"""
        if "stage" in request.data:
            stage_object = get_object_or_404(
                models.WorkflowStage,
                id=int(request.data.get("stage"))
            )
            if "is_end" in request.data:
                _validate_closing_status(
                    bool(request.data.get("is_end")),
                    stage_object
                )
            _assert_stage_belongs_to_same_workspace(
                self.get_workspace(),
                stage_object
            )

    def create(self, request, *args, **kwargs):
        self.serializer_class = serializers.TaskSerializer
        request.data["workspace"] = self.get_workspace().id
        request.data["creator"] = self.request.user.id
        self._validate_request(request)
        return super().create(request, *args, **kwargs)


class RetrieveUpdateDestroyTaskView(IdempotentCreationModelQuerySetProviderMixin,
                                    RetrieveUpdateDestroyAPIView, WorkspaceMixin):
    # pylint: disable=missing-class-docstring
    serializer_class = serializers.TaskUnwrappedSerializer
    queryset = models.Task.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace())

    def _assert_can_close_if_closing(self, old_object: models.Task) -> None:
        # pylint: disable=missing-function-docstring
        _validate_closing_status(task_is_open=False, stage_object=old_object.stage)

    def _assert_stage_belongs_to_same_workspace(self, task_object, stage_object):
        # pylint: disable=missing-function-docstring
        _assert_stage_belongs_to_same_workspace(task_object.workspace, stage_object)

    def _log_actions(self, old_object: models.Task, new_object: models.Task) -> None:
        """Try to log actions performed with task"""
        if "assignee" in self.request.data:
            models.AssigneeChangeAction.log(
                new_object,
                user=self.request.user,
                new_assignee=new_object.assignee
            )
        if "stage" in self.request.data:
            models.WorkflowPushAction.log(
                new_object,
                from_stage=old_object.stage,
                to_stage=new_object.stage,
                user=self.request.user
            )
        if "is_open" in self.request.data:
            self._log_state_change(new_object)

    def _log_state_change(self, new_object: models.Task) -> None:
        """Log task opening/closing"""
        models.OpenStateChangeAction.log(
            new_object,
            user=self.request.user,
            new_state=new_object.is_open
        )

    def _try_to_auto_open_or_close(self, new_object: models.Task) -> None:
        """
        If stage changed, try to open or close task
        according to stage's `is_end` policy
        """
        if "stage" in self.request.data:
            if new_object.stage is not None:
                new_object.is_open = not new_object.stage.is_end
                new_object.save()
                self._log_state_change(new_object)

    def _try_to_reschedule(self, new_object: models.Task) -> None:
        """
        If task was rearranged, make sure that
        notifications can be issued for it again
        """
        if ("arrangement_start" in self.request.data
                or "arrangement_end" in self.request.data):
            models.TaskNotifiedWithRuleFact.objects.filter(task=new_object).delete()

    def _validate_request(self, old_object) -> None:
        """Perform all validations"""
        if self.request.data.get("is_open") is False:
            self._assert_can_close_if_closing(old_object)
        if "stage" in self.request.data:
            self._assert_stage_belongs_to_same_workspace(
                old_object,
                get_object_or_404(
                    models.WorkflowStage,
                    id=int(self.request.data.get("stage"))
                )
            )

    def update(self, request, *args, **kwargs):
        """
        Updates task and logs actions.
        Also verifies that task can be closed
        """
        self.serializer_class = serializers.TaskSerializer
        old_object = self.get_object()
        self._validate_request(old_object)
        response = super().update(request, *args, **kwargs)
        new_object = self.get_object()
        self._log_actions(old_object, new_object)
        if "stage" in request.data:
            self._try_to_auto_open_or_close(new_object)
        self._try_to_reschedule(new_object)
        return response


class GetActivityOnTask(APIView, TaskMixin):
    # pylint: disable=missing-class-docstring
    def __init__(self):
        super().__init__()
        self.queried_type = None

    def _get_comments(self) -> list[dict]:
        """Get comments"""
        if self.queried_type is None or self.queried_type == "comments":
            return [
                {
                    "type": "comment",
                    **serializers.CommentUnwrappedSerializer(
                        x, context={'request': self.request}
                    ).data
                }
                for x in filter_confirmed(models.Comment, task=self.get_task())
            ]
        return []

    def _get_actions(self,
                     criteria: str,
                     model: Type[Model],
                     serializer: Type[ModelSerializer]) -> list[dict]:
        """Generic method to get actions if criteria is specified and then serialize"""
        if self.queried_type is None or self.queried_type == criteria:
            return [
                serializer(
                    x, context={'request': self.request}
                ).data
                for x in model.objects.filter(task=self.get_task())
            ]
        return []

    def _get_pushes(self) -> list[dict]:
        """Get workflow push actions"""
        return self._get_actions(
            "pushes",
            models.WorkflowPushAction,
            serializers.WorkflowPushSerializer
        )

    def _get_assignments(self) -> list[dict]:
        """Get assignment actions"""
        return self._get_actions(
            "assignments",
            models.AssigneeChangeAction,
            serializers.AssigneeChangeSerializer
        )

    def _get_state_changes(self) -> list[dict]:
        """Get state change actions"""
        return self._get_actions(
            "state-changes",
            models.OpenStateChangeAction,
            serializers.OpenStateChangeSerializer
        )

    def _get_all_activity(self) -> list[dict]:
        """Get all activity"""
        return (self._get_comments() +
                self._get_pushes() +
                self._get_assignments() +
                self._get_state_changes())

    def get(self, request, *args, **kwargs):
        """
        Get all activity on tasks: all logged actions + comments
        all in a single list ordered by time
        """
        self.queried_type = request.GET.get("type")
        activity = self._get_all_activity()
        activity.sort(
            key=lambda x: x["posted_at"] if "posted_at" in x else x["logged_at"],
            reverse=True
        )
        return Response(activity, status=200)
