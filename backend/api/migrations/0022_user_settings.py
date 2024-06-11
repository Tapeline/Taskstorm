# Generated by Django 5.0.2 on 2024-06-08 13:54

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0021_alter_workspace_settings'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='settings',
            field=models.JSONField(default=api.models.get_default_user_settings),
        ),
    ]