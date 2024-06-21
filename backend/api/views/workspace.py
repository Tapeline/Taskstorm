"""
Workspace-related views and utils
"""

from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.accessor import get_object_or_null
from api.exceptions import APIConflictException, APIBadRequestException, APIPermissionException
from api.views.pagination import LimitOffsetPaginationMixin


class WorkspaceMixin:
    """Provides method to get current workspace"""
    def get_workspace(self):
        """
        Get current workspace from url kwarg:
        /api/workspaces/<int:workspace_id>/...
        """
        return get_object_or_null(models.Workspace, id=self.kwargs.get("workspace_id"))


# pylint: disable=missing-class-docstring
class ListCreateWorkspaceView(ListCreateAPIView):
    serializer_class = serializers.WorkspaceUnwrappedSerializer
    queryset = models.Workspace.objects.all()
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        return super().get_queryset().filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        )

    def create(self, request, *args, **kwargs):
        self.serializer_class = serializers.WorkspaceSerializer
        request.data["owner"] = request.user.id
        return super().create(request, *args, **kwargs)


# pylint: disable=missing-class-docstring
class RetrieveUpdateDestroyWorkspaceView(RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.WorkspaceUnwrappedSerializer
    queryset = models.Workspace.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(
            Q(owner=self.request.user) | Q(members=self.request.user)
        )

    def update(self, request, *args, **kwargs):
        self.serializer_class = serializers.WorkspaceSerializer
        old_object = self.get_object()
        if "owner" in request.data and "members" in request.data:
            raise APIBadRequestException(
                "Cannot simultaneously set owner and members"
            )
        if "owner" in request.data:
            if old_object.owner.id != request.user.id:
                raise APIPermissionException("You don't own this workspace")
            all_member_ids = [m.id for m in old_object.members.all()]
            if request.data.get("owner") not in all_member_ids:
                raise APIConflictException(
                    "Ownership transfer only available to members of workspace"
                )
            new_members = [m.id for m in old_object.members.all()]
            new_members.append(old_object.owner.id)
            new_members.remove(request.data.get("owner"))
            request.data["members"] = new_members
        response = super().update(request, *args, **kwargs)
        return response


# pylint: disable=missing-class-docstring
class GetNotificationsByWorkspaceView(ListAPIView,
                                      WorkspaceMixin,
                                      LimitOffsetPaginationMixin):
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
        return self.cut_by_pagination(qs).order_by("issue_time").reverse()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if request.GET.get("mark_read") is not None:
            for notification in self.get_queryset():
                notification.is_read = True
                notification.save()
        return response
