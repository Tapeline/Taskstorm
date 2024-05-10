from datetime import datetime

from celery import shared_task
from django.db.models import Q
from django.utils import timezone

from api import models, notifier
from api.filtering import filters, parser as filter_parser


def is_task_applicable(now: datetime, task: models.Task, user,
                       filter_rule, rule: models.NotificationRule) -> bool:
    if not filters.applies_to_filter(task, user, filter_rule):
        return False
    delta = rule.get_time_delta()
    return now >= task.arrangement_start + delta


def find_tasks_for_rule(now: datetime, workspace: models.Workspace, user,
                                rule: models.NotificationRule) -> list:
    try:
        filter_rule = filter_parser.parse_filter_expression(rule.applicable_filter)
    except ValueError:
        return False
    tasks = [(task, user, rule) for task in models.Task.objects.filter(workspace=workspace)
             if is_task_applicable(now, task, user, filter_rule, rule)]
    return tasks


def find_tasks_for_workspace(now: datetime, workspace: models.Workspace, user):
    tasks = []
    for rule in models.NotificationRule.objects.filter(workspace=workspace):
        tasks.extend(find_tasks_for_rule(now, workspace, user, rule))
    return tasks


def find_tasks_for_user(now: datetime, user):
    tasks = []
    for workspace in models.Workspace.objects.filter(Q(owner=user) | Q(members=user)):
        tasks.extend(find_tasks_for_workspace(now, workspace, user))
    return tasks


def find_notifications_to_send():
    now = timezone.now()
    tasks = []
    for user in models.User.objects.all():
        tasks.extend(find_tasks_for_user(now, user))
    return tasks


@shared_task
def check_and_send_notifications():
    tasks = find_notifications_to_send()
    for task, user, used_rule in tasks:
        notifier.notify(task, user, used_rule)
