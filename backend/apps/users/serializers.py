from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'full_name',
                  'phone', 'age', 'city', 'bio', 'photo', 'role', 'is_active', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'phone', 'age', 'city', 'bio', 'photo', 'is_superuser', 'is_staff']
        read_only_fields = ['id', 'email', 'is_superuser', 'is_staff']


class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(validators=[validate_password])


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
class MemberRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'age', 'city', 'motivation', 'password']
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'password': {'write_only': True}
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value.lower()
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone=validated_data.get('phone', ''),
            age=validated_data.get('age'),
            city=validated_data.get('city', ''),
            bio=validated_data.get('motivation', ''),
            role='MEMBER_STANDARD',
            is_active=True,
            must_change_password=True
        )
        user.set_password(password)
        user.save()
        return user