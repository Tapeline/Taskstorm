from django.urls import path, include

urlpatterns = [
    path('auth/', include('api.urls.auth')),
    path('profile/', include('api.urls.profile')),
    path('workspaces/', include('api.urls.workspace')),
    path('workspaces/<int:workspace_id>/stages/', include('api.urls.workflow'))
]
