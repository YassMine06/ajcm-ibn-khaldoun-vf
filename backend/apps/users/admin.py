from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Configuration personnalisée de l'admin pour les membres
    """
    
    list_display = (
        'member_id',
        'email',
        'first_name',
        'last_name',
        'role',
        'phone',
        'city',
        'is_active',
        'date_joined'
    )
    
    list_filter = ('role', 'is_active', 'city')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    
    fieldsets = (
        ('Informations de connexion', {
            'fields': ('email', 'password')
        }),
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'phone', 'age', 'city', 'bio', 'photo')
        }),
        ('Permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Dates importantes', {
            'fields': ('last_login', 'date_joined'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    
    ordering = ('-date_joined',)
    
    def member_id(self, obj):
        return f"M-{obj.date_joined.year}-{obj.id:03d}"
    member_id.short_description = 'ID Membre'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.set_password(form.cleaned_data['password1'])
        super().save_model(request, obj, form, change)