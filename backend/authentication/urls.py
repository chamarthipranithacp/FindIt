from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register_user, name='register'),
    path('send-otp', views.send_otp, name='send_otp'),
    path('verify-otp', views.verify_otp, name='verify_otp'),
    path('login', views.login_user, name='login'),
    path('profile', views.get_profile, name='profile'),
    path('reset-password', views.reset_password, name='reset_password'),
]
