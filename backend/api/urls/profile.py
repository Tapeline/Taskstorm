from django.urls import path

from api import views

urlpatterns = [
    path("", views.profile.ProfileView.as_view()),
    path("notifications/", views.profile.GetNotificationsView.as_view()),
]
