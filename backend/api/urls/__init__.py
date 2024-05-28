from django.urls import path, include

urlpatterns = [
    path('auth/', include('api.urls.auth')),
    path('profile/', include('api.urls.profile')),
    path('workspaces/', include('api.urls.workspace')),
    path('workspaces/<int:workspace_id>/stages/', include('api.urls.workflow')),
    path('workspaces/<int:workspace_id>/tasks/', include('api.urls.tasks')),
    path('workspaces/<int:workspace_id>/notification-rules/', include('api.urls.notification_rules'))
]
