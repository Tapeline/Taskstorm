from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.views.workspace import WorkspaceMixin


class ListCreateTaskView(ListCreateAPIView, WorkspaceMixin):
    serializer_class = serializers.TaskSerializer
    queryset = models.Task.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace())

    def create(self, request, *args, **kwargs):
        request.data["workspace"] = self.get_workspace().id
        request.data["creator"] = self.request.user.id
        return super().create(request, *args, **kwargs)


class RetrieveUpdateDestroyTaskView(RetrieveUpdateDestroyAPIView, WorkspaceMixin):
    serializer_class = serializers.TaskSerializer
    queryset = models.Task.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace())

    def update(self, request, *args, **kwargs):
        old_object = self.get_object()
        response = super().update(request, *args, **kwargs)
        new_object = self.get_object()
        if "assignee" in request.data:
            models.AssigneeChange.log(new_assignee=request.data["assignee"])
        if "stage" in request.data:
            models.WorkflowPush.log(from_stage=old_object.stage,
                                    to_stage=new_object.stage,
                                    user=request.user)
        return response
