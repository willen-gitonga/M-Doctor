# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2019-07-13 13:51
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chemoapp', '0002_cancer'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cancer',
            name='patient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='chemoapp.Patient'),
        ),
    ]