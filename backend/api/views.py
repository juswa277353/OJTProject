# api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate
from django.db import IntegrityError # Import IntegrityError for database constraint errors

from .serializers import UserRegisterSerializer, UserLoginSerializer, GoogleAuthSerializer
from .models import CustomUser

# Helper function to get tokens for a user
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'role': user.role, # Include role in the response
        'phone_number': user.phone_number, # Include new field
        'birthday': user.birthday.isoformat() if user.birthday else None, # Include new field, format as ISO string
    }

class UserRegistrationView(APIView):
    """
    API endpoint for user registration with email and password.
    """
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save() # This calls the create method in the serializer
                tokens = get_tokens_for_user(user)
                return Response({
                    'message': 'User registered successfully.',
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'profile_picture': user.profile_picture,
                        'role': user.role,
                        'phone_number': user.phone_number,
                        'birthday': user.birthday.isoformat() if user.birthday else None,
                    },
                    'tokens': tokens,
                }, status=status.HTTP_201_CREATED)
            except IntegrityError:
                # This catches unique constraint violations, e.g., email already exists
                return Response(
                    {'email': ['A user with that email already exists.']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                # Catch any other unexpected errors during user creation
                print(f"Error during manual user registration: {e}") # Log to console
                return Response(
                    {'detail': 'An unexpected error occurred during registration.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """
    API endpoint for user login with email and password.
    Returns JWT tokens upon successful authentication.
    """
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
                    'profile_picture': user.profile_picture,
                    'role': user.role,
                    'phone_number': user.phone_number,
                    'birthday': user.birthday.isoformat() if user.birthday else None,
                },
                'tokens': tokens,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleAuthRegisterView(APIView):
    """
    API endpoint for Google OAuth registration.
    Receives Google ID token, verifies it, and creates/updates user.
    If the user already exists, it logs them in.
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
            
            # Get role from serializer's validated_data
            role = serializer.validated_data.get('role', 'guest')

            # Removed phone_number and birthday extraction from serializer.validated_data
            # as they are no longer sent from frontend for Google sign-up.

            print(f"VIEWS: Attempting Google registration for email: {email}")
            print(f"VIEWS: Role received from GoogleAuthSerializer: {role}")
            # Removed phone_number and birthday debug prints from here

            try:
                user = CustomUser.objects.get(email=email)
                print(f"VIEWS: User with email {email} found. Updating details and role.")

                user.first_name = first_name
                user.last_name = last_name
                user.profile_picture = profile_picture
                user.role = role # This is where the role from frontend is applied
                # Do NOT overwrite phone_number or birthday here, they are not from Google
                # and should retain existing values or remain None.
                user.save()
                print(f"VIEWS: Role after saving existing user: {user.role}")
                # Removed phone_number and birthday debug prints from here
                message = "User already exists and details updated. Logging in."
                status_code = status.HTTP_200_OK

            except CustomUser.DoesNotExist:
                print(f"VIEWS: User with email {email} does not exist. Creating new user.")
                try:
                    user = CustomUser.objects.create_user(
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        profile_picture=profile_picture,
                        role=role, # This applies the role for new users
                        # phone_number and birthday will be None as they are not provided by Google
                        phone_number=None, # Explicitly set to None for new Google users
                        birthday=None,     # Explicitly set to None for new Google users
                        is_active=True
                    )
                    user.set_unusable_password()
                    user.save()
                    print(f"VIEWS: Role after saving new user: {user.role}")
                    # Removed phone_number and birthday debug prints from here
                    message = "User registered via Google successfully."
                    status_code = status.HTTP_201_CREATED

                except IntegrityError as e:
                    print(f"VIEWS: IntegrityError CAUGHT during Google user creation for email {email}: {e}")
                    return Response(
                        {'detail': 'A user with this Google account email already exists. Please log in instead.'},
                        status=status.HTTP_409_CONFLICT
                    )
                except Exception as e:
                    print(f"VIEWS: Error creating Google user: {e}")
                    return Response(
                        {'detail': 'An unexpected error occurred during Google registration.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            tokens = get_tokens_for_user(user)
            return Response({
                'message': message,
                'user': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'role': user.role,
                    'phone_number': user.phone_number,
                    'birthday': user.birthday.isoformat() if user.birthday else None,
                },
                'tokens': tokens,
            }, status=status_code)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleAuthLoginView(APIView):
    """
    API endpoint for Google OAuth login.
    Receives Google ID token, verifies it, and logs in the existing user.
    If the user does not exist, it returns an error prompting them to sign up.
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if serializer.is_valid():
            google_user_info = serializer.get_user_info()
            email = google_user_info.get('email')
            
            # Get role from serializer's validated_data
            role = serializer.validated_data.get('role', None)
            # Removed phone_number and birthday extraction from serializer.validated_data
            # as they are no longer sent from frontend for Google login.

            print(f"VIEWS: Attempting Google login for email: {email}")
            print(f"VIEWS: Role received from GoogleAuthSerializer for login: {role}")
            # Removed phone_number and birthday debug prints from here

            try:
                user = CustomUser.objects.get(email=email)
                print(f"VIEWS: User with email {email} found for Google login. Updating details and role if provided.")

                user.first_name = google_user_info.get('given_name', user.first_name)
                user.last_name = google_user_info.get('family_name', user.last_name)
                user.profile_picture = google_user_info.get('picture', user.profile_picture)

                # Update role if it was provided in the request (from frontend selection)
                if role:
                    user.role = role
                
                # Do NOT overwrite phone_number or birthday during login from Google
                # They should retain existing values or remain None.
                user.save()
                print(f"VIEWS: Role after saving user during Google login: {user.role}")
                # Removed phone_number and birthday debug prints from here

                tokens = get_tokens_for_user(user)
                return Response({
                    'message': 'Logged in via Google successfully.',
                    'user': {
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'profile_picture': user.profile_picture,
                        'role': user.role,
                        'phone_number': user.phone_number,
                        'birthday': user.birthday.isoformat() if user.birthday else None,
                    },
                    'tokens': tokens,
                }, status=status.HTTP_200_OK)
            except CustomUser.DoesNotExist:
                print(f"VIEWS: User with email {email} does not exist for Google login. Prompting sign up.")
                return Response(
                    {'detail': 'User with this Google account does not exist. Please sign up first.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                print(f"VIEWS: Error during Google login for existing user: {e}")
                return Response(
                    {'detail': 'An unexpected error occurred during Google login.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
