from rest_framework import serializers
from .models import MembershipRequest, EventRegistrationRequest


class MembershipRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipRequest
        fields = '__all__'
        read_only_fields = ['id', 'status', 'created_at', 'updated_at', 'processed_at', 'created_user']


class MembershipRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipRequest
        fields = ['first_name', 'last_name', 'email', 'phone', 'age', 'city', 'motivation']


class EventRegistrationRequestSerializer(serializers.ModelSerializer):
    event_name = serializers.CharField(source='event.Event_Name', read_only=True)
    event_date = serializers.DateTimeField(source='event.start_date', read_only=True)

    class Meta:
        model = EventRegistrationRequest
        fields = '__all__'
        read_only_fields = ['id', 'status', 'created_at', 'confirmed_at']


class EventRegistrationRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistrationRequest
        fields = ['event', 'full_name', 'email', 'phone', 'notes']