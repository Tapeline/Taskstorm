from django.urls import path

from api import views

urlpatterns = [
    path("", views.notification_rules.ListCreateNotificationRuleView.as_view()),
    path("<int:pk>/", views.notification_rules.RetrieveUpdateDestroyNotificationRuleView.as_view()),
]
