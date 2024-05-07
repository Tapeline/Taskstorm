from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models, permissions


class ListCreateTaskView(ListCreateAPIView):
    serializer_class = serializers.TaskSerializer
    queryset = models.Task
    permission_classes = (IsAuthenticated, permissions.CanInteractWithWorkspace)

    def get_queryset(self):
        return super().get_queryset()

