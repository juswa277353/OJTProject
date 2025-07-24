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
    Includes password confirmation.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, default='user') # User can choose role

    class Meta:
        model = CustomUser
        fields = ('first_name', 'last_name', 'email', 'password', 'confirm_password', 'role')
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
            role=validated_data.get('role', 'user') # Ensure role is set, default to 'user'
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
            # authenticate() checks the credentials and returns the user object if valid
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
    Can also accept a 'role' for registration purposes.
    """
    token = serializers.CharField(required=True) # The Google ID token from the frontend
    role = serializers.ChoiceField(choices=CustomUser.ROLE_CHOICES, default='user', required=False) # Optional role for registration

    def validate_token(self, token):
        """
        Verify the Google ID token with Google's API.
        """
        try:
            # Specify the CLIENT_ID of the app that accesses the backend:
            # This verifies the token's audience against your Google Client ID
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), settings.GOOGLE_CLIENT_ID)

            # Ensure the issuer is correct
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            # Store the verified Google user info for later use in the view
            self.google_user_info = idinfo
            return token
        except ValueError:
            # Invalid token
            raise serializers.ValidationError("Invalid Google ID token.")
        except Exception as e:
            # Catch any other exceptions during verification
            raise serializers.ValidationError(f"Google token verification failed: {e}")

    def get_user_info(self):
        """
        Returns the verified Google user information.
        """
        return self.google_user_info
