from django.urls import path

from api import views

urlpatterns = [
    path("", views.workflow.ListCreateWorkflowStageView.as_view()),
    path("<int:pk>/", views.workflow.RetrieveUpdateDestroyWorkflowStageView.as_view()),
]
