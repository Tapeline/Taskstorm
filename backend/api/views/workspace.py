"""
Workspace-related views and utils
"""

from django.db.models import Q
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.accessor import get_object_or_null
from api.exceptions.exception_classes import SimultaneouslySetOwnerAndMemberListException, \
    OwnershipTransferToNonMemberException, NotAnOwnerException
from api.views.notifications import NotificationReaderMixin
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

    def _assert_owner_and_members_not_simultaneously_set(self) -> None:
        # pylint: disable=missing-function-docstring
        if "owner" in self.request.data and "members" in self.request.data:
            raise SimultaneouslySetOwnerAndMemberListException

    def _transfer_ownership(self, old_object) -> None:
        """Try to perform workspace ownership transfer"""
        if old_object.owner.id != self.request.user.id:
            raise NotAnOwnerException

        all_member_ids = [m.id for m in old_object.members.all()]
        if self.request.data.get("owner") not in all_member_ids:
            raise OwnershipTransferToNonMemberException

        new_members = [m.id for m in old_object.members.all()]
        new_members.append(old_object.owner.id)
        new_members.remove(self.request.data.get("owner"))
        self.request.data["members"] = new_members

    def update(self, request, *args, **kwargs):
        self.serializer_class = serializers.WorkspaceSerializer
        old_object = self.get_object()
        self._assert_owner_and_members_not_simultaneously_set()
        if "owner" in request.data:
            self._transfer_ownership(old_object)
        response = super().update(request, *args, **kwargs)
        return response


class GetNotificationsByWorkspaceView(ListAPIView,
                                      WorkspaceMixin,
                                      LimitOffsetPaginationMixin,
                                      NotificationReaderMixin):
    # pylint: disable=missing-class-docstring
    # pylint: disable=too-many-ancestors

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
        self.mark_read_if_needed(request, self.get_queryset())
        return response
