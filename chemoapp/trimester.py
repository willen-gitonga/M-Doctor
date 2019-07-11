from django.shortcuts import HttpResponse, render, redirect, get_object_or_404, reverse, get_list_or_404
from django.contrib.auth.forms import UserCreationForm
from django.core.mail import mail_admins
from django.contrib.auth.models import User
from django.contrib import auth, messages
from .forms import *
from .models import *
import datetime


def trimester1(request):
    return render(request, 'trimester 1.html')


def trimester2(request):
    return render(request, 'trimester 2.html')


def trimester3(request):
    return render(request, 'trimester 3.html')

def scrollytelling(request):
    return render(request, 'scrollytelling.html')
