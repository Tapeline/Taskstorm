# Generated by Django 5.0.2 on 2024-05-13 10:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_tasknotifiedwithrulefact'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='tags',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
