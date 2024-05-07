from rest_framework.permissions import BasePermission

from api import models
from api.accessor import get_object_or_null


class CanInteractWithWorkspace(BasePermission):
    def has_permission(self, request, view):
        w_id = request.data.get("workspace_id") or request.data.get("pk")
        workspace = get_object_or_null(models.Workspace, id=w_id)
        if workspace is None:
            return True
        return workspace.can_interact(request.user)
