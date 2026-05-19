from django.contrib import admin
from django.utils.html import format_html
from .models import Event, EventImage


class EventImageInline(admin.TabularInline):
    model = EventImage
    extra = 1
    fields = ('image_preview', 'image', 'caption', 'order')
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "📷"
    image_preview.short_description = 'Aperçu'


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    
    list_display = (
        'id',
        'poster_preview',
        'Event_Name',
        'type',
        'start_date',
        'start_time',
        'location',
        'city',
        'max_places',
        'registrations_count',
        'status',
        'status_colored',
        'is_upcoming',
    )
    
    list_filter = ('type', 'status', 'city', 'start_date')
    search_fields = ('Event_Name', 'description', 'location', 'guests')
    
    fieldsets = (
        ('📌 Informations principales', {
            'fields': ('Event_Name', 'type', 'description', 'status')
        }),
        ('📅 Dates et horaires', {
            'fields': ('start_date', 'start_time', 'end_date', 'Duration'),
            'classes': ('wide',)
        }),
        ('📍 Lieu et capacité', {
            'fields': ('location', 'city', 'max_places', 'Volunteers', 'Cost')
        }),
        ('🎨 Médias', {
            'fields': ('poster_preview_large', 'poster'),
            'classes': ('wide',)
        }),
        ('👥 Invités', {
            'fields': ('guests',),
            'classes': ('collapse',)
        }),
        ('🤖 IA et apprentissage', {
            'fields': ('predicted_social_impact', 'actual_social_impact', 
                       'actual_participants_count', 'member_satisfaction',
                       'ai_priority_score', 'used_for_ai_training'),
            'classes': ('collapse',)
        }),
        ('📋 Métadonnées', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [EventImageInline]
    readonly_fields = ('created_by', 'created_at', 'updated_at', 'poster_preview_large', 'registrations_count')
    date_hierarchy = 'start_date'
    ordering = ('-start_date',)
    
    actions = ['publish_events', 'unpublish_events', 'cancel_events']
    
    def poster_preview(self, obj):
        if obj.poster:
            return format_html(
                '<img src="{}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" />',
                obj.poster.url
            )
        return "📷"
    poster_preview.short_description = 'Poster'
    
    def poster_preview_large(self, obj):
        if obj.poster:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 8px;" />',
                obj.poster.url
            )
        return "📷 Aucun poster téléchargé"
    poster_preview_large.short_description = 'Aperçu du poster'
    
    def status_colored(self, obj):
        colors = {
            'DRAFT': '#ff9800',
            'PUBLISHED': '#4caf50',
            'CANCELLED': '#f44336',
            'COMPLET': '#9c27b0',
        }
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">{}</span>',
            colors.get(obj.status, '#666'),
            obj.get_status_display()
        )
    status_colored.short_description = 'Statut'
    
    def registrations_count(self, obj):
        count = obj.registrations_count
        if count == 0:
            return "0"
        return format_html('<span style="font-weight: bold; color: #2196f3;">{}</span>', count)
    registrations_count.short_description = 'Inscrits'
    
    # ✅ CORRECTION ICI
    def is_upcoming(self, obj):
        if obj.is_upcoming:
            return "✓ À venir"
        elif obj.is_ongoing:
            return "🟡 En cours"
        elif obj.is_past:
            return "✗ Passé"
        return "-"
    is_upcoming.short_description = 'État'
    
    def publish_events(self, request, queryset):
        updated = queryset.filter(status='DRAFT').update(status='PUBLISHED')
        self.message_user(request, f'✅ {updated} événement(s) publié(s)')
    publish_events.short_description = 'Publier les événements sélectionnés'
    
    def unpublish_events(self, request, queryset):
        updated = queryset.exclude(status='DRAFT').update(status='DRAFT')
        self.message_user(request, f'⚠️ {updated} événement(s) dépublié(s)')
    unpublish_events.short_description = 'Dépublier les événements sélectionnés'
    
    def cancel_events(self, request, queryset):
        updated = queryset.exclude(status='CANCELLED').update(status='CANCELLED')
        self.message_user(request, f'❌ {updated} événement(s) annulé(s)')
    cancel_events.short_description = 'Annuler les événements sélectionnés'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.save()


@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'event', 'order', 'image_preview', 'uploaded_at')
    list_filter = ('event', 'order')
    list_editable = ('order',)
    search_fields = ('event__Event_Name', 'caption')
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "Pas d'image"
    image_preview.short_description = 'Aperçu'
































    