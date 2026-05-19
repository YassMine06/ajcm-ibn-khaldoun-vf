from rest_framework import serializers
from .models import Event, EventImage


class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ['id', 'image', 'caption', 'order']


class EventSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    images = EventImageSerializer(many=True, read_only=True)
    registrations_count = serializers.IntegerField(read_only=True)
    places_remaining = serializers.IntegerField(read_only=True)
    
    poster_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'Event_Name', 'type', 'type_display', 'Duration', 'Cost', 'Volunteers',
            'description', 'start_date', 'end_date', 'location', 'city',
            'status', 'status_display', 'max_places',
            'created_by', 'created_by_name', 'images',
            'registrations_count', 'places_remaining',
            'poster', 'poster_url',
            'created_at', 'updated_at'
        ]


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']