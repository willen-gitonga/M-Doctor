from django.shortcuts import render
from django.shortcuts import HttpResponse, render, redirect, get_object_or_404, reverse, get_list_or_404
from django.contrib.auth.forms import UserCreationForm
from django.core.mail import mail_admins
from django.contrib.auth.models import User
from django.contrib import auth, messages
from .forms import *
from .models import *
import datetime
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.conf import settings
from django.views.generic import TemplateView
from datetime import datetime as dt
import json
import requests


def login(request):
    if request.user.is_authenticated():
        return redirect('home')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = auth.authenticate(username=username, password=password)

        if user is not None:
            # correct username and password login the user
            auth.login(request, user)
            return redirect('home')

        else:
            messages.error(request, 'Error wrong username/password')

    return render(request, 'auth/login.html')


def logout(request):
    print('logout')
    auth.logout(request)
    return redirect('login')


def verify_doctor(request):
    check_form = CheckDoctorsForm()
    context = {
        'check_form': check_form
    }
    if 'check_doctor' in request.GET and request.GET['check_doctor']:
        check_doctor = request.GET.get('check_doctor')
        request.session['check_doctor'] = check_doctor
        return redirect('signup_doctor')

    return render(request, 'auth/verify.html', context)


def signup(request):
    if request.method == 'POST':
        form = MyRegistrationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('login')

    form = MyRegistrationForm()

    context = {
        'form': form
    }
    return render(request, 'auth/register.html', context)


def signup_doctor(request):

    # verifying doctor section

    form = DoctorRegistrationForm()
    working_hours = DoctorWorkingHoursForm()

    context = {
        'form': form,
        'working_hours': working_hours
    }

    url = 'https://api.healthtools.codeforafrica.org/search/doctors?q={}'
    doctors_found = requests.get(url.format(
        request.session.get('check_doctor'))).json()
    doctors_found_list = []
    doctor_profile = DoctorProfileForm()
    context['doctor_profile'] = doctor_profile
    for doc_object in doctors_found['result']['hits']:
        doctor_obj = {
            'id': doc_object['_id'],
            'name': doc_object['_source']['name'],
            'score': doc_object['_score'],
            'doctor_type': doc_object['_source']['doctor_type'],
            'facility': doc_object['_source']['facility'],
            'postal_address': doc_object['_source']['postal_address'],
            'qualifications': doc_object['_source']['qualifications'],
            'reg_date': doc_object['_source']['reg_date'],
            'reg_no': doc_object['_source']['reg_no'],
            'speciality': doc_object['_source']['speciality'],
            'sub_speciality': doc_object['_source']['sub_speciality'],
        }
        doctors_found_list.append(doctor_obj)
        context['doctors'] = doctors_found_list[:10]

    # --- add doctor t0 database

    if request.method == 'POST':
        form = DoctorRegistrationForm(request.POST)
        working_hours = DoctorWorkingHoursForm(request.POST)
        print(form.is_valid())
        if form.is_valid():
            doc = form.save()
        reg_no = form.cleaned_data['reg_no']
        fee = form.cleaned_data['fee']
        last_name = form.cleaned_data['last_name']
        first_name = form.cleaned_data['first_name']
        print(reg_no, fee, last_name, first_name)
        for i in doctors_found_list:
            if reg_no == i['reg_no']:
                doc_details = i
                break
        doctor = Doctor.objects.create(
            user=doc,
            consultation_fee=fee,
            last_name=last_name,
            first_name=first_name)
        working_hours.save(doctor)
        doctor.make_appointments()
        print(doc_details)
        DoctorProfile.objects.create(
            doctor=doctor,
            name=doc_details['name'],
            score=doc_details['score'],
            registration_number=doc_details['reg_no'],
            registration_date=doc_details['reg_date'],
            nationality=doc_details['doctor_type'],
            facility=doc_details['facility'],
            postal_address=doc_details['postal_address'],
            speciality=doc_details['speciality'],
            sub_speciality=doc_details['sub_speciality'],
            qualifications=doc_details['qualifications']
        )
        print(DoctorProfile.objects.last())
        return redirect('login')
    return render(request, 'auth/register_doctor.html', context)

# -- General Pages views


def home(request):
    return render(request, 'index.html')



def search_doctors(request):
    search_form = SearchDoctorsForm()
    doctors = Doctor.get_all_doctors()
    searched_doctors = None

    ap_form = AppointmentForm()
    user = request.user

    if 'search_term' in request.GET and request.GET['search_term']:
        search_term = request.GET.get('search_term')
        searched_doctors = Doctor.search_doctors_by_term(search_term)

    context = {
        'search_form': search_form,
        'doctors': doctors,
        'searched_doctors': searched_doctors
    }
    if request.method == 'POST':
        ap_form = AppointmentForm(request.POST)
        print(ap_form.is_valid())
        user = request.user

        if ap_form.is_valid():
            print('booking appointement')
            appointment = ap_form.save(commit=False)
            doctor = Doctor.get_one_doctor(1)
            patient = Patient.get_patient(user)
            Appointment.book_appointment(appointment, doctor, patient)
            print('booked')
            return HttpResponse('commited to db')

    print(searched_doctors)
    context = {
        'search_form': search_form,
        'doctors': doctors,
        'searched_doctors': searched_doctors,
        'ap_form': ap_form
    }
    return render(request, 'doctors_search.html', context)


def individual_doctors_page(request, doctor_id, doctor_name):
    doctor = Doctor.get_one_doctor(doctor_id)
    context = {
        'doctor': doctor
    }
    return render(request, 'doctor_page.html', context)


def book_appointment(request):
    pass
#     ap_form = AppointmentForm()
#     user = request.user
#     print('here')
#     if ap_form.is_valid():
#         print('booking appointement')
#         # save the ap_form and submit the new item to the database
#         appointment = ap_form.save(commit=False)
#         doctor = Doctor.get_one_doctor(1)
#         appointment.book_appointment(doctor, user)

#         return HttpResponse('commited to db')


# def medicines(request):
#     if request.GET.get('search_term'):
#         medicines = Medication.search_medication(
#             request.GET.get('search_term'))

#     else:
#         medicines = Medication.objects.all()

#     return render(request, 'medicines.html', {'medicines': medicines})

def add_cancer(request):

    cancer = Cancer.objects.all()


    if request.method == 'POST':
        form = CancerForm(request.POST)
        if form.is_valid():
            ill = form.save(commit=False)
            ill.cancer=cancer
            ill.save()
        return redirect(cervical)
    else:
        form = CancerForm

    return render(request,'cancer.html',locals())





def cervical(request):
    cancer = Cancer.objects.all()
    return render(request, 'cervical.html')

