# Generated by Django 5.0.2 on 2024-05-10 14:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_notification'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='data',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
