import re
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models


def get_default_user_settings():
    return {"wp_sub": None}


class User(AbstractUser):
    settings = models.JSONField(default=get_default_user_settings)


class IssuedToken(models.Model):
    token = models.TextField()
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    date_of_issue = models.DateTimeField(auto_now_add=True, blank=True)
    is_invalidated = models.BooleanField(default=False)


def default_workspace_settings():
    return {"tag_coloring": {}, "views": []}


class Workspace(models.Model):
    owner = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="owning_workspaces")
    members = models.ManyToManyField(to=User, blank=True, default=list, related_name="member_in_workspaces")
    name = models.CharField(max_length=255)
    settings = models.JSONField(default=default_workspace_settings)

    def user_can_interact(self, user):
        return user == self.owner or user in self.members.all()


class Task(models.Model):
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
    assignee = models.ForeignKey(to=User, null=True, on_delete=models.CASCADE, related_name="assigned_tasks")
    stage = models.ForeignKey(to="WorkflowStage", null=True, on_delete=models.SET_NULL)
    parent_task = models.ForeignKey(to="Task", on_delete=models.SET_NULL, null=True, default=None)
    linked_tasks = models.ManyToManyField(to="Task", blank=True, default=list, related_name="linked_to_tasks")
    created_at = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    task = models.ForeignKey(to=Task, on_delete=models.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    text = models.TextField()
    posted_at = models.DateTimeField(auto_now_add=True)


class Document(models.Model):
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    data = models.JSONField()


class WorkflowStage(models.Model):
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    name = models.CharField(max_length=64)
    color = models.CharField(max_length=6, default="00FF00")
    is_end = models.BooleanField()


class NotificationRule(models.Model):
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    applicable_filter = models.TextField()
    time_delta = models.CharField(max_length=255)

    @classmethod
    def is_valid_time_delta(cls, time_delta):
        return re.match(r"^[\+\-]\d+:\d\d$", time_delta)

    def get_time_delta(self):
        sign = str(self.time_delta)[0]
        hours, minutes = map(int, self.time_delta[1:].split(":"))
        return timedelta(hours=hours, minutes=minutes) if sign == "+" else \
            -timedelta(hours=hours, minutes=minutes)


class Notification(models.Model):
    workspace = models.ForeignKey(to=Workspace, on_delete=models.CASCADE)
    recipient = models.ForeignKey(to=User, on_delete=models.CASCADE)
    issue_time = models.DateTimeField(auto_now_add=True)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)


class TaskNotifiedWithRuleFact(models.Model):
    task = models.ForeignKey(to=Task, on_delete=models.CASCADE)
    rule = models.ForeignKey(to=NotificationRule, on_delete=models.CASCADE)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)


class AbstractLoggableAction(models.Model):
    logged_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=255)
    task = models.ForeignKey(to=Task, on_delete=models.CASCADE)

    @classmethod
    def log(cls, task, **kwargs):
        cls.objects.create(type=cls.type, task=task, **kwargs)


class WorkflowPushAction(AbstractLoggableAction):
    type = "push"

    from_stage = models.ForeignKey(to=WorkflowStage, on_delete=models.CASCADE,
                                   related_name="pushes_from", null=True)
    to_stage = models.ForeignKey(to=WorkflowStage, on_delete=models.CASCADE,
                                 related_name="pushes_to", null=True)
    user = models.ForeignKey(to=User, on_delete=models.CASCADE)


class AssigneeChangeAction(AbstractLoggableAction):
    type = "assign"

    user = models.ForeignKey(to=User, on_delete=models.CASCADE, related_name="my_assignee_changes")
    new_assignee = models.ForeignKey(to=User, null=True, on_delete=models.CASCADE)


class OpenStateChangeAction(AbstractLoggableAction):
    type = "state"

    user = models.ForeignKey(to=User, on_delete=models.CASCADE)
    new_state = models.BooleanField()
