from django.urls import path

from api import views

urlpatterns = [
    path("", views.comments.ListCreateCommentView.as_view()),
    path("<int:pk>/", views.comments.RetrieveUpdateDestroyCommentView.as_view()),
]
