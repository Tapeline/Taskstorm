from django.urls import path, include

from api import views

urlpatterns = [
    path("", views.tasks.ListCreateTaskView.as_view()),
    path("<int:pk>/", views.tasks.RetrieveUpdateDestroyTaskView.as_view()),
    path("<int:task_id>/comments/", include("api.urls.comments")),
    path("<int:task_id>/activity/", views.tasks.GetActivityOnTask.as_view()),
]
