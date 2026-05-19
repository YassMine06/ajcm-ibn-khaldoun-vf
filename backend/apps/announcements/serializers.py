from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    start_date = serializers.DateTimeField(allow_null=True, required=False)
    end_date = serializers.DateTimeField(allow_null=True, required=False)
    expires_at = serializers.DateTimeField(allow_null=True, required=False)

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'author']