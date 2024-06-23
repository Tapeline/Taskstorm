"""
Recommendation algorithms
"""

from api import models
from api.data import crop_list


def get_recommended_tasks_for_user(user: models.User) -> list[models.Task]:
    """
    Simple recommendation algorithm:
    gets last 5 tasks this user has been assigned to
    """
    latest_assignments = models.AssigneeChangeAction.objects.filter(
        new_assignee=user
    ).order_by("-logged_at")
    return crop_list([x.task for x in latest_assignments if x.task.is_open], 5)
