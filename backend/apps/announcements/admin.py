# apps/announcements/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    
    list_display = (
        'id',
        'title',
        'type',
        'location',
        'start_date',
        'end_date',
        'is_active',
        'is_featured',
        'image_preview'
    )
    
    list_filter = ('type', 'is_active', 'is_featured', 'start_date')
    search_fields = ('title', 'content', 'location')
    
    fieldsets = (
        ('📝 Contenu', {
            'fields': ('title', 'content', 'type')
        }),
        ('📅 Dates', {
            'fields': ('start_date', 'end_date'),
            'classes': ('wide',)
        }),
        ('📍 Lieu', {
            'fields': ('location',)
        }),
        ('🖼️ Image', {
            'fields': ('image', 'image_preview_large')
        }),
        ('👁️ Visibilité', {
            'fields': ('is_active', 'is_featured')
        }),
        ('🔗 Liens', {
            'fields': ('event', 'author'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('image_preview_large',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "📷"
    image_preview.short_description = 'Image'
    
    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />',
                obj.image.url
            )
        return "📷 Aucune image"
    image_preview_large.short_description = 'Aperçu'