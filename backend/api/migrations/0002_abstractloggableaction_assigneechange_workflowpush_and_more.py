# Generated by Django 5.0.2 on 2024-05-04 18:04

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AbstractLoggableAction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logged_at', models.DateTimeField(auto_now_add=True)),
                ('type', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='AssigneeChange',
            fields=[
                ('abstractloggableaction_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.abstractloggableaction')),
                ('new_assignee', models.CharField(max_length=255)),
            ],
            bases=('api.abstractloggableaction',),
        ),
        migrations.CreateModel(
            name='WorkflowPush',
            fields=[
                ('abstractloggableaction_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.abstractloggableaction')),
                ('from_stage', models.CharField(max_length=255)),
                ('to_stage', models.CharField(max_length=255)),
            ],
            bases=('api.abstractloggableaction',),
        ),
        migrations.CreateModel(
            name='Workspace',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('members', models.ManyToManyField(blank=True, default=list, related_name='member_in_workspaces', to=settings.AUTH_USER_MODEL)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='owning_workspaces', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='WorkflowStage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=64)),
                ('color', models.CharField(default='00FF00', max_length=6)),
                ('is_end', models.BooleanField()),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.workspace')),
            ],
        ),
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('state', models.CharField(max_length=255)),
                ('is_open', models.BooleanField()),
                ('tags', models.CharField(max_length=255)),
                ('folder', models.CharField(max_length=255)),
                ('time_bounds_start', models.DateTimeField(null=True)),
                ('time_bounds_end', models.DateTimeField(null=True)),
                ('arrangement_start', models.DateTimeField(null=True)),
                ('arrangement_end', models.DateTimeField(null=True)),
                ('assignees', models.ManyToManyField(blank=True, default=list, related_name='assigned_tasks', to=settings.AUTH_USER_MODEL)),
                ('creator', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('workspace', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.workspace')),
            ],
        ),
    ]
