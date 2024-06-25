# pylint: disable=missing-class-docstring
# pylint: disable=too-many-ancestors
"""
Document-related views
"""

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.views.utils.idempotency import IdempotentCreationModelQuerySetProviderMixin
from api.views.workspace import WorkspaceMixin


class ListCreateDocumentView(IdempotentCreationModelQuerySetProviderMixin,
                             ListCreateAPIView, WorkspaceMixin):
    serializer_class = serializers.DocumentSerializer
    queryset = models.Document.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace()).order_by("title")

    def create(self, request, *args, **kwargs):
        request.data["workspace"] = self.get_workspace().id
        request.data["data"] = {"ops": []}
        return super().create(request, *args, **kwargs)


class RetrieveUpdateDestroyDocumentView(IdempotentCreationModelQuerySetProviderMixin,
                                        RetrieveUpdateDestroyAPIView, WorkspaceMixin):
    serializer_class = serializers.DocumentSerializer
    queryset = models.Document.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(workspace=self.get_workspace())
