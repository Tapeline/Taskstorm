import os
from celery import Celery

from api import tasks

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "taskstorm.settings")
app = Celery("taskstorm")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(60.0, tasks.check_and_send_notifications, name='check and send notifications')
