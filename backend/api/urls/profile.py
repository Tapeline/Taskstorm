from django.urls import path

from api import views

urlpatterns = [
    path("", views.profile.ProfileView.as_view()),
    path("notifications/", views.profile.GetNotificationsView.as_view()),
    path("all/", views.profile.GetAllUsersView.as_view()),
    path("stats/", views.profile.GetUserStats.as_view()),
    path("recommended/", views.profile.GetUserRecommendations.as_view()),
    path("tasks/", views.profile.GetAllUserTasks.as_view()),
]
