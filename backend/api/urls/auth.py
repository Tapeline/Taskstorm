from django.urls import path

from api import views

urlpatterns = [
    path("register/", views.auth.RegisterView.as_view()),
    path("login/", views.auth.LoginView.as_view()),
]
