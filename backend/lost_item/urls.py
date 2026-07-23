from django.urls import path
from . import views

urlpatterns = [
    # Lost Items
    path('lost/', views.lost_items_list_create, name='lost_items_list_create'),
    path('lost/<str:item_id>/', views.delete_lost_item, name='delete_lost_item'),
    
    # Found Items
    path('found/', views.found_items_list_create, name='found_items_list_create'),
    path('found/<str:item_id>/', views.delete_found_item, name='delete_found_item'),
    path('found/<str:item_id>/verify/', views.verify_found_item, name='verify_found_item'),
    
    # Claims
    path('claim/', views.claim_item, name='claim_item'),
    path('claims/', views.claims_list, name='claims_list'),
    path('claims/<str:claim_id>/approve/', views.approve_claim, name='approve_claim'),
    path('claims/<str:claim_id>/reject/', views.reject_claim, name='reject_claim'),
    
    # Notifications
    path('notifications/', views.notifications_list, name='notifications_list'),
    path('notifications/<str:notif_id>/read/', views.mark_notification_read, name='mark_notification_read'),
    
    # Security Scan / Handover
    path('claims/verify-qr/', views.verify_qr, name='verify_qr'),
    path('claims/handover/', views.confirm_handover, name='confirm_handover'),
]
