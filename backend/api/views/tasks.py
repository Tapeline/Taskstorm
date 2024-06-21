"""
Task-related views and utils
"""

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api import serializers, models, permissions
from api.accessor import get_object_or_null
from api.exceptions import APIConflictException
from api.views.pagination import LimitOffsetPaginationMixin
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


# pylint: disable=missing-class-docstring
class ListCreateTaskView(ListCreateAPIView, WorkspaceMixin, LimitOffsetPaginationMixin):
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
            except ValueError:
                return qs
            id_list = [obj.id for obj in qs.all()
                       if filters.applies_to_filter(obj, self.request.user, filter_rule)]
            qs = qs.filter(id__in=id_list)
        return self.cut_by_pagination(qs)

    def get_filters(self):
        return self.request.GET.get("filters")

    def create(self, request, *args, **kwargs):
        self.serializer_class = serializers.TaskSerializer
        request.data["workspace"] = self.get_workspace().id
        request.data["creator"] = self.request.user.id
        return super().create(request, *args, **kwargs)


# pylint: disable=missing-class-docstring
class RetrieveUpdateDestroyTaskView(RetrieveUpdateDestroyAPIView, WorkspaceMixin):
    serializer_class = serializers.TaskUnwrappedSerializer
    queryset = models.Task.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace())

    def update(self, request, *args, **kwargs):
        # TODO: too much going on. Refactor: split into different methods
        """
        Updates task and logs actions.
        Also verifies that task can be closed
        """
        self.serializer_class = serializers.TaskSerializer
        old_object = self.get_object()
        if request.data.get("is_open") is False:
            if old_object.stage is not None and not old_object.stage.is_end:
                raise APIConflictException("Task cannot be closed until its stage is not at end")
        response = super().update(request, *args, **kwargs)
        new_object = self.get_object()
        if "assignee" in request.data:
            models.AssigneeChangeAction.log(new_object, user=request.user,
                                            new_assignee=new_object.assignee)
        if "stage" in request.data:
            models.WorkflowPushAction.log(new_object,
                                          from_stage=old_object.stage,
                                          to_stage=new_object.stage,
                                          user=request.user)
            if new_object.stage is not None:
                new_object.is_open = not new_object.stage.is_end
                new_object.save()
                if new_object.stage.is_end:
                    models.OpenStateChangeAction.log(new_object, user=request.user,
                                                     new_state=new_object.is_open)
        if "is_open" in request.data:
            models.OpenStateChangeAction.log(new_object, user=request.user,
                                             new_state=new_object.is_open)
        if "arrangement_start" in request.data or "arrangement_end" in request.data:
            models.TaskNotifiedWithRuleFact.objects.filter(task=new_object).delete()
        return response


# pylint: disable=missing-class-docstring
class GetActivityOnTask(APIView, TaskMixin):
    def get(self, request, *args, **kwargs):
        # TODO: too much going on. Refactor: split into different methods
        """
        Get all activity on tasks: all logged actions + comments
        all in a single list ordered by time
        """
        queried_type = request.GET.get("type")
        comments, pushes, assignments, state_changes = [], [], [], []
        if queried_type is None or queried_type == "comments":
            comments = [
                {
                    "type": "comment",
                    **serializers.CommentUnwrappedSerializer(x, context={'request': request}).data
                }
                for x in models.Comment.objects.filter(
                    task=self.get_task())]
        if queried_type is None or queried_type == "pushes":
            pushes = [serializers.WorkflowPushSerializer(x, context={'request': request}).data
                      for x in models.WorkflowPushAction.objects.filter(
                    task=self.get_task())]
        if queried_type is None or queried_type == "assignments":
            assignments = [serializers.AssigneeChangeSerializer(x, context={'request': request}).data
                           for x in models.AssigneeChangeAction.objects.filter(
                    task=self.get_task())]
        if queried_type is None or queried_type == "state-changes":
            state_changes = [serializers.OpenStateChangeSerializer(x, context={'request': request}).data
                             for x in models.OpenStateChangeAction.objects.filter(
                    task=self.get_task())]
        activity = comments + pushes + assignments + state_changes
        activity.sort(key=lambda x: x["posted_at"] if "posted_at" in x else x["logged_at"], reverse=True)
        return Response(activity, status=200)
