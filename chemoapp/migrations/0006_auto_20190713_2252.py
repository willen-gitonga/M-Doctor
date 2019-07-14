# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-07-13 19:52
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chemoapp', '0005_auto_20190713_1835'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cancer',
            name='illness',
            field=models.CharField(choices=[('Cervical Cancer', 'Cervical Cancer'), ('Breast Cancer', 'Breast Cancer'), ('Leukemia', 'Leukemia')], max_length=50),
        ),
    ]
