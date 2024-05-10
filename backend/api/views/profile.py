from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models
from api.views.pagination import LimitOffsetPaginationMixin


class ProfileView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.UserSerializer

    def get_object(self):
        return self.request.user


class GetNotificationsView(ListAPIView, LimitOffsetPaginationMixin):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.NotificationSerializer
    queryset = models.Notification.objects.all()

    def get_queryset(self):
        return self.cut_by_pagination(super().get_queryset().filter(recipient=self.request.user))

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if request.GET.get("read") is not None:
            for notification in self.get_queryset():
                notification.is_read = True
                notification.save()
