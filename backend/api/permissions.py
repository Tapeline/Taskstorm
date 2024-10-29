"""
Describes permissions
"""

from rest_framework.permissions import BasePermission

from api import models
from api.accessor import get_object_or_null


class CanInteractWithWorkspace(BasePermission):
    """
    Checks if user can interact with given workspace.
    User can interact if he is an owner or is listed in members.
    Workspace is get through url kwarg workspace_id or pk
    """
    def has_permission(self, request, view):
        w_id = request.data.get("workspace_id") or request.data.get("pk")
        workspace = get_object_or_null(models.Workspace, id=w_id)
        if workspace is None:
            return True
        return workspace.user_can_interact(request.user)


class CanInteractWithCommentObject(BasePermission):
    """
    Checks if user can update/destroy comment
    (possible only if user is the author of that comment)
    """
    def has_object_permission(self, request, view, obj):
        return obj.user.id == request.user.id
