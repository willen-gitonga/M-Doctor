# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-07-13 19:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chemoapp', '0006_auto_20190713_2252'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cancer',
            name='illness',
            field=models.CharField(max_length=50),
        ),
    ]