# pylint: disable=missing-class-docstring
# pylint: disable=too-many-ancestors
"""
Comment-related views
"""

from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions
from api.views.tasks import TaskMixin
from api.views.utils.idempotency import IdempotentCreationModelQuerySetProviderMixin


class ListCreateCommentView(IdempotentCreationModelQuerySetProviderMixin,
                            ListCreateAPIView, TaskMixin):
    serializer_class = serializers.CommentUnwrappedSerializer
    queryset = models.Comment.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset().filter(task=self.get_task()).order_by("posted_at")

    def create(self, request, *args, **kwargs):
        self.serializer_class = serializers.CommentSerializer
        request.data["task"] = self.get_task().id
        request.data["user"] = self.request.user.id
        return super().create(request, *args, **kwargs)


class RetrieveUpdateDestroyCommentView(IdempotentCreationModelQuerySetProviderMixin,
                                       RetrieveUpdateDestroyAPIView, TaskMixin):
    serializer_class = serializers.CommentUnwrappedSerializer
    queryset = models.Comment.objects.all()
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace,
                          permissions.CanInteractWithCommentObject)

    def get_queryset(self):
        return super().get_queryset().filter(task=self.get_task())

    def update(self, request, *args, **kwargs):
        self.serializer_class = serializers.CommentSerializer
        return super().update(request, *args, **kwargs)
