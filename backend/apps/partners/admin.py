from django.contrib import admin
from .models import Partner


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'type', 'website', 'is_active', 'order', 'created_at')
    list_filter = ('type', 'is_active')
    search_fields = ('name', 'description')
    list_editable = ('order', 'is_active')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Informations', {
            'fields': ('name', 'type', 'description', 'website', 'logo')
        }),
        ('Affichage', {
            'fields': ('is_active', 'order')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )