import os
from celery import Celery

from api import tasks
from taskstorm import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "taskstorm.settings")
app = Celery("taskstorm")
app.conf.broker_url = settings.CELERY_BROKER_URL

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(20.0, tasks.check_and_send_notifications, name='check and send notifications')


if __name__ == "__main__":
    app.start()
