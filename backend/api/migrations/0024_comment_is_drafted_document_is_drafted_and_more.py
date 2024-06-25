# Generated by Django 5.0.2 on 2024-06-24 21:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0023_user_profile_pic'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='is_drafted',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='document',
            name='is_drafted',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationrule',
            name='is_drafted',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='task',
            name='is_drafted',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='workflowstage',
            name='is_drafted',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='workspace',
            name='is_drafted',
            field=models.BooleanField(default=True),
        ),
    ]
