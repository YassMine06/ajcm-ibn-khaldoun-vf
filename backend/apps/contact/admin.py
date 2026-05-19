from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """
    Configuration de l'interface admin pour les messages de contact
    """
    
    list_display = (
        'id',
        'name',
        'email',
        'subject_preview',
        'status_colored',
        'created_at',
        'replied_at_display'
    )
    
    list_filter = ('status', 'created_at', 'replied_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('created_at', 'updated_at', 'replied_at')
    
    fieldsets = (
        ('Expéditeur', {
            'fields': ('name', 'email', 'user')
        }),
        ('Message', {
            'fields': ('subject', 'message')
        }),
        ('Traitement', {
            'fields': ('status', 'admin_reply', 'replied_at')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read_action', 'mark_as_replied_action', 'archive_action']
    
    def subject_preview(self, obj):
        if len(obj.subject) > 40:
            return obj.subject[:37] + '...'
        return obj.subject
    subject_preview.short_description = 'Sujet'
    
    def status_colored(self, obj):
        colors = {
            'UNREAD': '#f44336',
            'READ': '#ff9800',
            'REPLIED': '#4caf50',
            'ARCHIVED': '#9e9e9e',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 15px; font-size: 11px;">{}</span>',
            colors.get(obj.status, '#666'),
            obj.get_status_display()
        )
    status_colored.short_description = 'Statut'
    
    def replied_at_display(self, obj):
        if obj.replied_at:
            return obj.replied_at.strftime('%d/%m/%Y %H:%M')
        return '-'
    replied_at_display.short_description = 'Répondu le'
    
    def mark_as_read_action(self, request, queryset):
        updated = 0
        for message in queryset:
            if message.status == 'UNREAD':
                message.mark_as_read()
                updated += 1
        self.message_user(request, f'{updated} message(s) marqué(s) comme lu(s)')
    mark_as_read_action.short_description = 'Marquer comme lu'
    
    def mark_as_replied_action(self, request, queryset):
        updated = queryset.exclude(status='REPLIED').update(
            status='REPLIED',
            replied_at=timezone.now()
        )
        self.message_user(request, f'{updated} message(s) marqué(s) comme répondu(s)')
    mark_as_replied_action.short_description = 'Marquer comme répondu'
    
    def archive_action(self, request, queryset):
        updated = queryset.update(status='ARCHIVED')
        self.message_user(request, f'{updated} message(s) archivé(s)')
    archive_action.short_description = 'Archiver'