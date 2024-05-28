import logging
from datetime import datetime

from celery import shared_task
from celery.utils.log import get_task_logger
from django.db.models import Q
from django.utils import timezone

from api import notifier
from api.filtering import filters, parser as filter_parser


def is_task_applicable(now: datetime, task, user, filter_rule, rule) -> bool:
    if not filters.applies_to_filter(task, user, filter_rule):
        return False
    if task.arrangement_start is None:
        return False
    delta = rule.get_time_delta()
    print(task.arrangement_start, delta)
    return now >= task.arrangement_start + delta


def find_tasks_for_rule(now: datetime, workspace, user, rule) -> list:
    try:
        filter_rule = filter_parser.parse_filter_expression(rule.applicable_filter)
    except ValueError:
        return False
    from api import models
    tasks = [(task, user, rule) for task in models.Task.objects.filter(workspace=workspace)
             if is_task_applicable(now, task, user, filter_rule, rule)]
    logging.info(f"      Tasks found: {tasks}")
    return tasks


def find_tasks_for_workspace(now: datetime, workspace, user):
    tasks = []
    from api import models
    for rule in models.NotificationRule.objects.filter(workspace=workspace):
        logging.info(f"    Checking rule {rule.id}")
        tasks.extend(find_tasks_for_rule(now, workspace, user, rule))
    return tasks


def find_tasks_for_user(now: datetime, user):
    tasks = []
    from api import models
    for workspace in models.Workspace.objects.filter(Q(owner=user) | Q(members=user)):
        logging.info(f"  Checking workspace {workspace.name}")
        tasks.extend(find_tasks_for_workspace(now, workspace, user))
    return tasks


def find_notifications_to_send():
    now = timezone.now()
    tasks = []
    from api import models
    for user in models.User.objects.all():
        logging.info(f"Checking user {user.username}")
        tasks.extend(find_tasks_for_user(now, user))
    return tasks


logger = get_task_logger(__name__)


@shared_task
def check_and_send_notifications():
    logging.info("Checking notifications to send")
    tasks = find_notifications_to_send()
    logging.info(f"{len(tasks)} enqueued")
    for task, user, used_rule in tasks:
        from api import models
        if not models.TaskNotifiedWithRuleFact.objects.filter(user=user, task=task, rule=used_rule).exists():
            notifier.notify(task, user, used_rule)
            models.TaskNotifiedWithRuleFact.objects.create(user=user, task=task, rule=used_rule)
