from django.urls import path
from .views import (
    CreateMembershipRequestView,
    CreateEventRegistrationRequestView,
    AdminMembershipRequestListView,
    AdminMembershipRequestActionView,
    AdminEventRegistrationRequestListView,
)

urlpatterns = [
    # Routes publiques
    path('membership-requests/', CreateMembershipRequestView.as_view(), name='create-membership-request'),
    path('event-requests/', CreateEventRegistrationRequestView.as_view(), name='create-event-request'),

    # Routes ADMIN
    path('admin/membership-requests/', AdminMembershipRequestListView.as_view(), name='admin-membership-requests'),
    path('admin/membership-requests/<int:pk>/action/', AdminMembershipRequestActionView.as_view(), name='admin-membership-action'),
    path('admin/event-requests/', AdminEventRegistrationRequestListView.as_view(), name='admin-event-requests'),
]