# Generated by Django 5.0.2 on 2024-05-07 18:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_remove_task_state_alter_task_folder_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='task',
            old_name='assignees',
            new_name='assignee',
        ),
        migrations.AddField(
            model_name='task',
            name='stage',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.workflowstage'),
        ),
    ]
