from api.models import Notification


def notify(user, task, rule):
    Notification.objects.create(
        workspace=task.workspace,
        recipient=user,
        message=f"{task.name} is about to start: {task.arrangement_start}",
        data={"task": task.__dict__}
    )
    print(f"{user.username} <- {task.name} is about to start: {task.arrangement_start}")
