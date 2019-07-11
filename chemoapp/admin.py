from django.contrib import admin
from .models import *

admin.site.register(Doctor)
admin.site.register(DoctorSpeciality)
admin.site.register(LiveChat)
admin.site.register(Patient)
admin.site.register(Location)
admin.site.register(DoctorWorkingHours)
admin.site.register(Appointment)
admin.site.register(AppointmentDetails)
