from django.urls import path, include

from api import views

urlpatterns = [
    path("", views.workspace.ListCreateWorkspaceView.as_view()),
    path("<int:pk>/", views.workspace.RetrieveUpdateDestroyWorkspaceView.as_view()),
    path("<int:workspace_id>/notifications/", views.workspace.GetNotificationsByWorkspaceView.as_view()),
    path('<int:workspace_id>/stages/', include('api.urls.workflow')),
    path('<int:workspace_id>/tasks/', include('api.urls.tasks')),
    path('<int:workspace_id>/documents/', include('api.urls.documents')),
    path('<int:workspace_id>/notification-rules/', include('api.urls.notification_rules'))
]
