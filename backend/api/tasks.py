# pylint: disable=import-outside-toplevel
"""
Celery tasks
"""

import logging
from datetime import datetime

from celery import shared_task
from celery.utils.log import get_task_logger
from django.db.models import Q
from django.utils import timezone

from api import notifier
from api.filtering import filters, parser as filter_parser


def is_task_applicable(now: datetime, task, user, filter_rule, rule) -> bool:
    # pylint: disable=missing-function-docstring
    if not filters.applies_to_filter(task, user, filter_rule):
        return False
    if task.arrangement_start is None:
        return False
    delta = rule.get_time_delta()
    return now >= task.arrangement_start + delta


def find_tasks_for_rule(now: datetime, workspace, user, rule) -> list:
    # pylint: disable=missing-function-docstring
    try:
        filter_rule = filter_parser.parse_filter_expression(rule.applicable_filter)
    except ValueError:
        return False
    from api import models
    tasks = [(task, user, rule) for task in models.Task.objects.filter(workspace=workspace)
             if is_task_applicable(now, task, user, filter_rule, rule)]
    logging.info(f"      Tasks found: %s", tasks)
    return tasks


def find_tasks_for_workspace(now: datetime, workspace, user):
    # pylint: disable=missing-function-docstring
    tasks = []
    from api import models
    for rule in models.NotificationRule.objects.filter(workspace=workspace):
        logging.info(f"    Checking rule %s", rule.id)
        tasks.extend(find_tasks_for_rule(now, workspace, user, rule))
    return tasks


def find_tasks_for_user(now: datetime, user):
    # pylint: disable=missing-function-docstring
    tasks = []
    from api import models
    for workspace in models.Workspace.objects.filter(Q(owner=user) | Q(members=user)):
        logging.info(f"  Checking workspace %s", workspace.name)
        tasks.extend(find_tasks_for_workspace(now, workspace, user))
    return tasks


def find_notifications_to_send():
    # pylint: disable=missing-function-docstring
    now = timezone.now()
    tasks = []
    from api import models
    for user in models.User.objects.all():
        logging.info(f"Checking user %s", user.username)
        tasks.extend(find_tasks_for_user(now, user))
    return tasks


logger = get_task_logger(__name__)


@shared_task
def check_and_send_notifications():
    # pylint: disable=missing-function-docstring
    logging.info("Checking notifications to send")
    tasks = find_notifications_to_send()
    logging.info(f"%s enqueued", len(tasks))
    for task, user, used_rule in tasks:
        from api import models
        if not models.TaskNotifiedWithRuleFact.objects.filter(user=user,
                                                              task=task,
                                                              rule=used_rule).exists():
            notifier.notify(task, user)
            models.TaskNotifiedWithRuleFact.objects.create(user=user,
                                                           task=task,
                                                           rule=used_rule)
