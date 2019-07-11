from django.shortcuts import HttpResponse, render, redirect, get_object_or_404, reverse, get_list_or_404
from django.contrib.auth.forms import UserCreationForm
from django.core.mail import mail_admins
from django.contrib.auth.models import User
from django.contrib import auth, messages
from .forms import *
from .models import *
import datetime


def profile_edit(request):
    form = PatientForm()
    context = {
        'form': form
    }
    return render(request, 'patient_edit.html', context)


def due(request):
    return render(request, 'patient/info.html')


def antenatal(request):
    return render(request, 'patient/antenatal.html')


def patient_profile(request):
    return render(request, 'patient_profile.html')
