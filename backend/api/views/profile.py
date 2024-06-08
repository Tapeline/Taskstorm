from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated

from api import serializers, models
from api.views.pagination import LimitOffsetPaginationMixin


class ProfileView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.MyProfileSerializer

    def get_object(self):
        return self.request.user


class GetNotificationsView(ListAPIView, LimitOffsetPaginationMixin):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.NotificationSerializer
    queryset = models.Notification.objects.all().order_by("issue_time").reverse()

    def get_queryset(self):
        qs = super().get_queryset().filter(recipient=self.request.user)
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


class GetAllUsersView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.UserSerializer
    queryset = models.User.objects.all()
