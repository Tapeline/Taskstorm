from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.views.workspace import WorkspaceMixin


class ListCreateWorkflowStageView(ListCreateAPIView, WorkspaceMixin):
    serializer_class = serializers.WorkflowStageSerializer
    queryset = models.WorkflowStage.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace())

    def create(self, request, *args, **kwargs):
        request.data["workspace"] = self.get_workspace().id
        return super().create(request, *args, **kwargs)


class RetrieveUpdateDestroyWorkflowStageView(RetrieveUpdateDestroyAPIView, WorkspaceMixin):
    serializer_class = serializers.WorkflowStageSerializer
    queryset = models.WorkflowStage.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace())
