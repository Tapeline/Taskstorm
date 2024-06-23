"""
Tools for calculating statistics on users
"""

from datetime import datetime
from itertools import groupby

from django.utils import timezone

from api import models
from api.data import ObjDict

TimeRange = tuple[datetime, datetime]


def get_tasks_created_during_range_count(time_range: TimeRange, user) -> int:
    # pylint: disable=missing-function-docstring
    return len(models.Task.objects.filter(created_at__gte=time_range[0],
                                          created_at__lte=time_range[1],
                                          creator=user))


def get_workflow_push_during_range_count(time_range: TimeRange, user) -> int:
    # pylint: disable=missing-function-docstring
    return len(models.WorkflowPushAction.objects.filter(
        logged_at__gte=time_range[0],
        logged_at__lte=time_range[1],
        user=user
    ))


def get_closed_tasks_during_range_count(time_range: TimeRange, user) -> int:
    # pylint: disable=missing-function-docstring
    return len(models.OpenStateChangeAction.objects.filter(
        logged_at__gte=time_range[0],
        logged_at__lte=time_range[1],
        new_state=False,
        user=user
    ))


def get_task_close_quality_percent_during_range(time_range: TimeRange, user):
    """
    Gets "Task Closing Quality Percent" of user during given range
    Task Closing Quality Percent:
        (closed by user and then reopened tasks) / (all closed tasks by user)
    """
    state_changes = models.OpenStateChangeAction.objects.filter(
        logged_at__gte=time_range[0],
        logged_at__lte=time_range[1],
        user=user
    ).order_by("logged_at")
    openings = list(filter(lambda x: x.new_state == models.Task.TASK_OPEN, state_changes))
    closings = list(filter(lambda x: x.new_state == models.Task.TASK_CLOSED, state_changes))
    now = timezone.now()
    reopen_count = 0
    for closing in closings:
        next_closings = list(filter(
            lambda x, closing_=closing:
            x.logged_at > closing_.logged_at and
            x.task == closing_.task,
            closings
        ))
        scan_until = next_closings[0] if len(next_closings) != 0 else now
        reopenings = list(filter(
            lambda x, closing_=closing, scan_until_=scan_until:
            closing_.logged_at < x.logged_at < scan_until_ and
            x.task == closing_.task,
            openings
        ))
        reopen_count += len(reopenings) > 0
    return ((1 - (reopen_count / len(closings)) if len(closings) != 0 else None),
            (reopen_count, len(closings)))


def get_actions_distributed_by_days(time_range: TimeRange, user) -> list[tuple[datetime, int]]:
    """
    Get all actions count on each day
    """
    actions = (
        list(models.WorkflowPushAction.objects.filter(
            logged_at__gte=time_range[0],
            logged_at__lte=time_range[1],
            user=user
        ))
        +
        list(models.AssigneeChangeAction.objects.filter(
            logged_at__gte=time_range[0],
            logged_at__lte=time_range[1],
            user=user
        ))
        +
        list(models.OpenStateChangeAction.objects.filter(
            logged_at__gte=time_range[0],
            logged_at__lte=time_range[1],
            user=user
        ))
        +
        list(models.Task.objects.filter(
            created_at__gte=time_range[0],
            created_at__lte=time_range[1],
            creator=user
        ))
    )
    actions = [x.created_at if isinstance(x, models.Task) else x.logged_at
               for x in actions]
    grouped = [list(x) for _, x in groupby(sorted([x.date() for x in actions]))]
    print(grouped)
    return [(group[0], len(group)) for group in grouped]


def get_all_stats_during_range(time_range: TimeRange, user) -> dict:
    # pylint: disable=missing-function-docstring
    return ObjDict(
        tasks_created=get_tasks_created_during_range_count(time_range, user),
        workflow_pushes=get_workflow_push_during_range_count(time_range, user),
        closed_tasks=get_closed_tasks_during_range_count(time_range, user),
        close_quality=get_task_close_quality_percent_during_range(time_range, user)
    )
