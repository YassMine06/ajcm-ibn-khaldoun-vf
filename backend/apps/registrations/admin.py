from django.contrib import admin
from django.utils.html import format_html
from .models import MembershipRequest, EventRegistrationRequest
from .services import MembershipRequestService


@admin.register(MembershipRequest)
class MembershipRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'age', 'city', 'status', 'created_at')
    list_filter = ('status', 'city', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')
    readonly_fields = ('created_at', 'updated_at')
    actions = ['approve_requests', 'reject_requests']

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = 'Nom complet'

    def approve_requests(self, request, queryset):
        count = 0
        for req in queryset.filter(status='PENDING'):
            if MembershipRequestService.approve(req):
                count += 1
        self.message_user(request, f'{count} demande(s) approuvée(s)')
    approve_requests.short_description = 'Approuver les demandes'

    def reject_requests(self, request, queryset):
        count = 0
        for req in queryset.filter(status='PENDING'):
            if MembershipRequestService.reject(req):
                count += 1
        self.message_user(request, f'{count} demande(s) rejetée(s)')
    reject_requests.short_description = 'Rejeter les demandes'


@admin.register(EventRegistrationRequest)
class EventRegistrationRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'full_name', 'email', 'event', 'status', 'created_at')
    list_filter = ('status', 'event', 'created_at')
    search_fields = ('full_name', 'email', 'event__Event_Name')
    readonly_fields = ('created_at', 'confirmed_at')