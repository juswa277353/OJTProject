# api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate

from .serializers import UserRegisterSerializer, UserLoginSerializer, GoogleAuthSerializer
from .models import CustomUser

# Helper function to get tokens for a user
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role, # Include role in the response
    }

class UserRegistrationView(APIView):
    """
    API endpoint for user registration with email and password.
    """
    # These views still use default authentication classes (JWTAuthentication)
    # but AllowAny permission allows unauthenticated access.
    # The JWTAuthentication will run but won't find a valid token, which is fine.
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'User registered successfully.',
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                },
                'tokens': tokens,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """
    API endpoint for user login with email and password.
    """
    # Same as UserRegistrationView regarding authentication classes.
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Login successful.',
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                },
                'tokens': tokens,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleAuthRegisterView(APIView):
    """
    API endpoint for Google OAuth registration.
    Receives Google ID token, verifies it, and creates/updates user.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if serializer.is_valid():
            google_user_info = serializer.get_user_info()
            email = google_user_info.get('email')
            first_name = google_user_info.get('given_name', '')
            last_name = google_user_info.get('family_name', '')
            profile_picture = google_user_info.get('picture', None)
            role = serializer.validated_data.get('role', 'user') # Default to 'user' if not specified

            try:
                # Check if user already exists
                user = CustomUser.objects.get(email=email)
                # If user exists, update their details if necessary (e.g., profile picture)
                user.first_name = first_name
                user.last_name = last_name
                user.profile_picture = profile_picture
                user.save()
                message = "User already exists and details updated. Logging in."
            except CustomUser.DoesNotExist:
                # If user does not exist, create a new one
                user = CustomUser.objects.create_user(
                    email=email,
                    # No password needed here, it will be set to unusable below
                    first_name=first_name,
                    last_name=last_name,
                    profile_picture=profile_picture,
                    role=role,
                    is_active=True # Google users are active by default
                )
                user.set_unusable_password() # <--- CORRECTED LINE: Set password to unusable
                user.save() # <--- IMPORTANT: Save the user after setting unusable password
                message = "User registered via Google successfully."

            tokens = get_tokens_for_user(user)
            return Response({
                'message': message,
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'role': user.role,
                },
                'tokens': tokens,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleAuthLoginView(APIView):
    """
    API endpoint for Google OAuth login.
    Receives Google ID token, verifies it, and logs in the existing user.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if serializer.is_valid():
            google_user_info = serializer.get_user_info()
            email = google_user_info.get('email')

            try:
                user = CustomUser.objects.get(email=email)
                # Update user details from Google if they've changed
                user.first_name = google_user_info.get('given_name', user.first_name)
                user.last_name = google_user_info.get('family_name', user.last_name)
                user.profile_picture = google_user_info.get('picture', user.profile_picture)
                user.save()

                tokens = get_tokens_for_user(user)
                return Response({
                    'message': 'Logged in via Google successfully.',
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'profile_picture': user.profile_picture,
                        'role': user.role,
                    },
                    'tokens': tokens,
                }, status=status.HTTP_200_OK)
            except CustomUser.DoesNotExist:
                return Response(
                    {'detail': 'User with this Google account does not exist. Please sign up first.'},
                    status=status.HTTP_404_NOT_FOUND
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
