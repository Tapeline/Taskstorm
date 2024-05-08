from django.urls import path

from api import views

urlpatterns = [
    path("", views.tasks.ListCreateTaskView.as_view()),
    path("<int:pk>/", views.tasks.RetrieveUpdateDestroyTaskView.as_view()),
]
