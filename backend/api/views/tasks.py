from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.exceptions import APIConflictException
from api.views.pagination import LimitOffsetPaginationMixin
from api.views.workspace import WorkspaceMixin
from api.filtering import filters, parser as filter_parser


class ListCreateTaskView(ListCreateAPIView, WorkspaceMixin, LimitOffsetPaginationMixin):
    serializer_class = serializers.TaskUnwrappedSerializer
    queryset = models.Task.objects.order_by("id")
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
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


class RetrieveUpdateDestroyTaskView(RetrieveUpdateDestroyAPIView, WorkspaceMixin):
    serializer_class = serializers.TaskUnwrappedSerializer
    queryset = models.Task.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace())

    def update(self, request, *args, **kwargs):
        self.serializer_class = serializers.TaskSerializer
        old_object = self.get_object()
        if request.data.get("is_open") is False:
            if old_object.stage is not None and not old_object.stage.is_end:
                raise APIConflictException("Task cannot be closed until its stage is not at end")
        response = super().update(request, *args, **kwargs)
        new_object = self.get_object()
        if "assignee" in request.data:
            models.AssigneeChange.log(new_assignee=new_object.assignee)
        if "stage" in request.data:
            models.WorkflowPush.log(from_stage=old_object.stage,
                                    to_stage=new_object.stage,
                                    user=request.user)
        if "arrangement_start" in request.data or "arrangement_end" in request.data:
            models.TaskNotifiedWithRuleFact.objects.filter(task=new_object).delete()
        return response
