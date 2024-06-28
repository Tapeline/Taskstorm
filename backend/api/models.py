"""
Describes ORM models
"""

import re
import uuid
from datetime import timedelta
from typing import Type

from PIL import Image
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import QuerySet


def transform_to_queryset(model: Type[models.Model],
                          obj_list: list[models.Model]) -> QuerySet:
    """
    Transform list of ORM objects to Django queryset
    Does not guarantee preservation of order!
    """
    return model.objects.filter(id__in=[x.id for x in obj_list])


def get_default_user_settings() -> dict:
    """
    Default settings for user
    wp_sub - webpush notification subscription
    """
    return {"wp_sub": None}


def upload_pfp_to(instance, filename) -> str:
    # pylint: disable=unused-argument
    """Get path for profile picture"""
    return f"pfp/{uuid.uuid4()}.{filename.split('.')[-1]}"


class User(AbstractUser):
    """User model"""
    settings = models.JSONField(default=get_default_user_settings)
    profile_pic = models.ImageField(upload_to=upload_pfp_to, blank=True, null=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.profile_pic.name is None:
            return
        if len(self.profile_pic.name) < 1:
            return
        image = Image.open(self.profile_pic.path)
        image.save(self.profile_pic.path, quality=20, optimize=True)


class IssuedToken(models.Model):
    """Model for invalidable JWT"""
    token = models.TextField()
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    date_of_issue = models.DateTimeField(auto_now_add=True, blank=True)
    is_invalidated = models.BooleanField(default=False)


def default_workspace_settings():
    """
    Default workspace settings
    tag_coloring - {tag name: hex color} - map for custom tag coloring
    views - not implemented yet
    """
    return {"tag_coloring": {}, "views": []}


class IdempotentCreationModel(models.Model):
    """Provides field for achieving idempotency on creation"""
    class Meta:
        abstract = True
    is_drafted = models.BooleanField(default=True)


class Workspace(IdempotentCreationModel):
    """Workspace model"""
    owner = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="owning_workspaces")
    members = models.ManyToManyField(to=User, blank=True,
                                     default=list,
                                     related_name="member_in_workspaces")
    name = models.CharField(max_length=255)
    settings = models.JSONField(default=default_workspace_settings)

    def user_can_interact(self, user):
        """Check if user can interact with workspace"""
        return user == self.owner or user in self.members.all()


class Task(IdempotentCreationModel):
    """Task model"""
    name = models.CharField(max_length=255)
    description = models.TextField()
    is_open = models.BooleanField(default=True)
    creator = models.ForeignKey(to=User, on_delete=models.CASCADE)
    tags = models.CharField(max_length=255, default="", blank=True)
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    folder = models.CharField(max_length=255, default="Public")
    time_bounds_start = models.DateTimeField(null=True)
    time_bounds_end = models.DateTimeField(null=True)
    arrangement_start = models.DateTimeField(null=True)
    arrangement_end = models.DateTimeField(null=True)
    assignee = models.ForeignKey(to=User, null=True,
                                 on_delete=models.CASCADE,
                                 related_name="assigned_tasks")
    stage = models.ForeignKey(to="WorkflowStage", null=True,
                              on_delete=models.SET_NULL)
    parent_task = models.ForeignKey(to="Task", on_delete=models.SET_NULL,
                                    null=True, default=None)
    linked_tasks = models.ManyToManyField(to="Task", blank=True,
                                          default=list,
                                          related_name="linked_to_tasks")
    created_at = models.DateTimeField(auto_now_add=True)

    TASK_OPEN = True
    TASK_CLOSED = False


class Comment(IdempotentCreationModel):
    """Task comment model"""
    task = models.ForeignKey(to=Task, on_delete=models.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    text = models.TextField()
    posted_at = models.DateTimeField(auto_now_add=True)


class Document(IdempotentCreationModel):
    """Workspace document model"""
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    data = models.JSONField()


class WorkflowStage(IdempotentCreationModel):
    """Workflow stage model"""
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    color = models.CharField(max_length=6, default="00FF00")
    is_end = models.BooleanField()


class NotificationRule(IdempotentCreationModel):
    """
    Notification rule model
    Describes under which circumstances a notification should be sent.
    applicable_filter - filters applicable tasks
    time_delta - offset from task's arrangement_start - when to issue
            notification. Format: -HH:MM or +HH:MM
            -00:05 means that notification will be issued 5 mins before
            arrangement_start, +00:05 - 5 mins after arrangement_start
    """
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    applicable_filter = models.TextField()
    time_delta = models.CharField(max_length=255)

    @classmethod
    def is_valid_time_delta(cls, time_delta):
        """Time delta format validator"""
        return re.match(r"^[\+\-]\d+:\d\d$", time_delta)

    def get_time_delta(self):
        """Translate text time delta into datetime.timedelta"""
        sign = str(self.time_delta)[0]
        hours, minutes = map(int, self.time_delta[1:].split(":"))
        return timedelta(hours=hours, minutes=minutes) if sign == "+" else \
            -timedelta(hours=hours, minutes=minutes)


class Notification(models.Model):
    """Notification model"""
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    recipient = models.ForeignKey(to=User, on_delete=models.CASCADE)
    issue_time = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)


class TaskNotifiedWithRuleFact(models.Model):
    """
    States that task has been notified
    with certain rule to avoid duplicate notifications
    """
    task = models.ForeignKey(to=Task, on_delete=models.CASCADE)
    rule = models.ForeignKey(to=NotificationRule, on_delete=models.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)


class AbstractLoggableAction(models.Model):
    """ABC for loggable actions on tasks"""
    logged_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=255)
    task = models.ForeignKey(to=Task, on_delete=models.CASCADE)

    @classmethod
    def log(cls, task, **kwargs):
        """Create action log with given paramters"""
        cls.objects.create(type=cls.type, task=task, **kwargs)


class WorkflowPushAction(AbstractLoggableAction):
    """Issued when workflow stage of task has changed (incl. to and from None)"""
    type = "push"

    from_stage = models.ForeignKey(to=WorkflowStage, on_delete=models.CASCADE,
                                   related_name="pushes_from", null=True)
    to_stage = models.ForeignKey(to=WorkflowStage, on_delete=models.CASCADE,
                                 related_name="pushes_to", null=True)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)


class AssigneeChangeAction(AbstractLoggableAction):
    """Issued when task is assigned to someone (incl. assign to None - unassignement)"""
    type = "assign"

    user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="my_assignee_changes")
    new_assignee = models.ForeignKey(to=User, null=True, on_delete=models.CASCADE)


class OpenStateChangeAction(AbstractLoggableAction):
    """Issued when task is opened or closed (incl. auto-closing)"""
    type = "state"

    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    new_state = models.BooleanField()
