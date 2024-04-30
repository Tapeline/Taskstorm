from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class IssuedToken(models.Model):
    token = models.TextField()
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    date_of_issue = models.DateTimeField(auto_now_add=True, blank=True)
    is_invalidated = models.BooleanField(default=False)
