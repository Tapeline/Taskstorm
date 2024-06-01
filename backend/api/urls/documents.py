from django.urls import path

from api import views

urlpatterns = [
    path("", views.documents.ListCreateDocumentView.as_view()),
    path("<int:pk>/", views.documents.RetrieveUpdateDestroyDocumentView.as_view()),
]
