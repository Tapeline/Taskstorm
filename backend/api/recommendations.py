from api import models
from api.data import crop_list


def get_recommended_tasks_for_user(user):
    latest_assignments = models.AssigneeChangeAction.objects.filter(
        new_assignee=user
    ).order_by("-logged_at")
    return crop_list([x.task for x in latest_assignments if x.task.is_open], 5)
