# Generated by Django 5.0.2 on 2024-06-04 18:36

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_openstatechange_abstractloggableaction_task'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='openstatechange',
            name='abstractloggableaction_ptr',
        ),
        migrations.RemoveField(
            model_name='workflowpush',
            name='abstractloggableaction_ptr',
        ),
        migrations.RemoveField(
            model_name='workflowpush',
            name='from_stage',
        ),
        migrations.RemoveField(
            model_name='workflowpush',
            name='to_stage',
        ),
        migrations.RemoveField(
            model_name='workflowpush',
            name='user',
        ),
        migrations.CreateModel(
            name='AssigneeChangeAction',
            fields=[
                ('abstractloggableaction_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.abstractloggableaction')),
                ('new_assignee', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='my_assignee_changes', to=settings.AUTH_USER_MODEL)),
            ],
            bases=('api.abstractloggableaction',),
        ),
        migrations.CreateModel(
            name='OpenStateChangeAction',
            fields=[
                ('abstractloggableaction_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.abstractloggableaction')),
                ('new_state', models.BooleanField()),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            bases=('api.abstractloggableaction',),
        ),
        migrations.CreateModel(
            name='WorkflowPushAction',
            fields=[
                ('abstractloggableaction_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.abstractloggableaction')),
                ('from_stage', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pushes_from', to='api.workflowstage')),
                ('to_stage', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='pushes_to', to='api.workflowstage')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            bases=('api.abstractloggableaction',),
        ),
        migrations.DeleteModel(
            name='AssigneeChange',
        ),
        migrations.DeleteModel(
            name='OpenStateChange',
        ),
        migrations.DeleteModel(
            name='WorkflowPush',
        ),
    ]
