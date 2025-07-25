# api/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings # To access GOOGLE_CLIENT_ID from settings

# For Google ID token verification
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with email, password, and role.
    Includes password confirmation, phone number, and birthday.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, default='guest') # Updated default role
    phone_number = serializers.CharField(max_length=20, required=False, allow_blank=True) # New field
    birthday = serializers.DateField(required=False, allow_null=True) # New field

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'password', 'confirm_password', 'role', 'phone_number', 'birthday')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }

    def validate(self, data):
        """
        Check that the two password fields match.
        """
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        """
        Create and return a new `CustomUser` instance, given the validated data.
        """
        validated_data.pop('confirm_password') # Remove confirm_password as it's not a model field
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'guest'), # Ensure role is set, default to 'guest'
            phone_number=validated_data.get('phone_number', None), # Save new field
            birthday=validated_data.get('birthday', None) # Save new field
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login with email and password.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, data):
        """
        Validate user credentials and authenticate the user.
        """
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid login credentials.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        data['user'] = user # Store the authenticated user in validated_data
        return data

class GoogleAuthSerializer(serializers.Serializer):
    """
    Serializer to handle Google ID token verification and extract user information.
    Only expects 'token' and 'role' from the frontend.
    """
    token = serializers.CharField(required=True) # The Google ID token from the frontend
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, default='guest', required=False) # Optional role for registration

    def validate(self, data):
        """
        Verify the Google ID token with Google's API and perform other validations.
        """
        print(f"GoogleAuthSerializer received data: {data}") # Debug print: See all data received
        token = data.get('token')
        role_from_data = data.get('role')

        print(f"GoogleAuthSerializer extracted role: {role_from_data}")
        # Removed phone_number and birthday debug prints as they are no longer expected from frontend

        if not token:
            raise serializers.ValidationError({"token": "Google ID token is required."})

        try:
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)

            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            self.google_user_info = idinfo
            return data # Return the entire validated data dictionary
        except ValueError:
            raise serializers.ValidationError("Invalid Google ID token.")
        except Exception as e:
            raise serializers.ValidationError(f"Google token verification failed: {e}")

    def get_user_info(self):
        """
        Returns the verified Google user information.
        """
        return self.google_user_info
