# Generated by Django 5.0.2 on 2024-05-07 18:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_workflowpush_user_alter_assigneechange_new_assignee_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='task',
            name='state',
        ),
        migrations.AlterField(
            model_name='task',
            name='folder',
            field=models.CharField(default='Public', max_length=255),
        ),
        migrations.AlterField(
            model_name='task',
            name='is_open',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='task',
            name='tags',
            field=models.CharField(default='', max_length=255),
        ),
    ]