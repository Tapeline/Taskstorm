# pylint: disable=missing-class-docstring
"""
Profile-related views
"""

from datetime import timedelta

from django.db.models import Q
from django.utils import timezone
from rest_framework.generics import RetrieveUpdateDestroyAPIView, ListAPIView, UpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api import serializers, models, statistics, recommendations
from api.views.notifications import NotificationCacheMixin
from api.views.utils.pagination import LimitOffsetPaginationMixin


class ProfileView(RetrieveUpdateDestroyAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.MyProfileSerializer

    def get_object(self):
        return self.request.user


class GetNotificationsView(NotificationCacheMixin, ListAPIView,
                           LimitOffsetPaginationMixin):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.NotificationSerializer
    queryset = models.Notification.objects.all().order_by("issue_time").reverse()
    notification_cache_key = "profile"

    def get_queryset(self):
        qs = super().get_queryset().filter(recipient=self.request.user)
        if self.request.GET.get("only_unread") is not None:
            qs = qs.filter(is_read=False)
        return self.cut_by_pagination(qs)


class GetAllUsersView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = serializers.UserSerializer
    queryset = models.User.objects.all()


class GetUserStats(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, *args, **kwargs):
        """Get user statistics for past: day, week, month"""
        now = timezone.now()
        response_data: dict = {
            cat: statistics.get_all_stats_during_range(time_range, request.user)
            for cat, time_range in {
                "day": (now - timedelta(hours=24), now),
                "week": (now - timedelta(days=7), now),
                "month": (now - timedelta(days=30), now)
            }.items()
        }
        response_data["distributed"] = statistics.get_actions_distributed_by_days(
            (now - timedelta(days=30), now), request.user
        )
        return Response(response_data, status=200)


class GetUserRecommendations(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.TaskUnwrappedSerializer

    def get_queryset(self):
        tasks = recommendations.get_recommended_tasks_for_user(self.request.user)
        return models.transform_to_queryset(models.Task, tasks)


class GetAllUserTasks(ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.TaskUnwrappedSerializer
    queryset = models.Task.objects.all()

    def get_queryset(self):
        return super().get_queryset().filter(
            Q(creator=self.request.user) | Q(assignee=self.request.user)
        )


class SetProfilePicture(UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = serializers.UserProfilePicSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user
