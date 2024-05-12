def notify(task, user, rule):
    from api.models import Notification
    Notification.objects.create(
        workspace=task.workspace,
        recipient=user,
        message=f"{task.name} is about to start: {task.arrangement_start}",
        data={"task": str(task.__dict__)}
    )
    print(f"{user.username} <- {task.name} is about to start: {task.arrangement_start}")
