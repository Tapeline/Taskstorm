from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.accessor import get_object_or_null
from api.views.pagination import LimitOffsetPaginationMixin


class WorkspaceMixin:
    def get_workspace(self):
        return get_object_or_null(models.Workspace, id=self.kwargs.get("workspace_id"))


class ListCreateWorkspaceView(ListCreateAPIView):
    serializer_class = serializers.WorkspaceUnwrappedSerializer
    queryset = models.Workspace.objects.all()
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return super().get_queryset().filter(Q(owner=self.request.user) | Q(members=self.request.user))

    def create(self, request, *args, **kwargs):
        self.serializer_class = serializers.WorkspaceSerializer
        request.data["owner"] = request.user.id
        return super().create(request, *args, **kwargs)


class RetrieveUpdateDestroyWorkspaceView(RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.WorkspaceUnwrappedSerializer
    queryset = models.Workspace.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(Q(owner=self.request.user) | Q(members=self.request.user))

    def update(self, request, *args, **kwargs):
        self.serializer_class = serializers.WorkspaceSerializer
        return super().update(request, *args, **kwargs)


class GetNotificationsByWorkspaceView(ListAPIView, WorkspaceMixin, LimitOffsetPaginationMixin):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.NotificationSerializer
    queryset = models.Notification.objects.all()

    def get_queryset(self):
        qs = super().get_queryset().filter(
            recipient=self.request.user,
            workspace=self.get_workspace()
        )
        if self.request.GET.get("only_unread") is not None:
            qs = qs.filter(is_read=False)
        return self.cut_by_pagination(qs)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if request.GET.get("mark_read") is not None:
            for notification in self.get_queryset():
                notification.is_read = True
                notification.save()
        return response
