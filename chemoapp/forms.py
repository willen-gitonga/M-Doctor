from django import forms
# fill in custom user info then save it
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import *
from django.contrib.admin.widgets import AdminDateWidget, AdminTimeWidget
from django.forms.fields import DateField


class MyRegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(required=False)
    last_name = forms.CharField(required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super(MyRegistrationForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']

        user.save()

        return user


class DoctorRegistrationForm(UserCreationForm):
    first_name = forms.CharField(required=False)
    last_name = forms.CharField(required=False)
    email = forms.EmailField(required=True)
    reg_no = forms.CharField(required=False)
    fee = forms.IntegerField(required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super(DoctorRegistrationForm, self).save(commit=False)
        user.email = self.cleaned_data['email']
        user.consultation_fee = self.cleaned_data['fee']
        reg_no = self.cleaned_data['reg_no']

        user.save()

        return user


class SearchDoctorsForm(forms.Form):
    search_term = forms.CharField(max_length=50)


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        exclude = ['poster', 'date']


class PostForm(forms.ModelForm):
    class Meta:
        model = Posts
        exclude = ['posted_by']


class CheckDoctorsForm(forms.Form):
    check_doctor = forms.CharField(max_length=50)
