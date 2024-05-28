from django.urls import path

from api import views

urlpatterns = [
    path("", views.workspace.ListCreateWorkspaceView.as_view()),
    path("<int:pk>/", views.workspace.RetrieveUpdateDestroyWorkspaceView.as_view()),
    path("<int:workspace_id>/notifications/", views.workspace.GetNotificationsByWorkspaceView.as_view()),
]
