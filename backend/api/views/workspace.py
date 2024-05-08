from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.accessor import get_object_or_null


class WorkspaceMixin:
    def get_workspace(self):
        return get_object_or_null(models.Workspace, id=self.kwargs.get("workspace_id"))


class ListCreateWorkspaceView(ListCreateAPIView):
    serializer_class = serializers.WorkspaceSerializer
    queryset = models.Workspace.objects.all()
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return super().get_queryset().filter(Q(owner=self.request.user) | Q(members=self.request.user))

    def create(self, request, *args, **kwargs):
        request.data["owner"] = request.user.id
        return super().create(request, *args, **kwargs)


class RetrieveUpdateDestroyWorkspaceView(RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.WorkspaceSerializer
    queryset = models.Workspace.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(Q(owner=self.request.user) | Q(members=self.request.user))
