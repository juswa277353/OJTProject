# api/urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView, # You can use this for a simple JWT login if not using custom login view
    TokenRefreshView,
)
from .views import (
    UserRegistrationView,
    UserLoginView,
    GoogleAuthRegisterView,
    GoogleAuthLoginView,
)

urlpatterns = [
    # Standard email/password authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),

    # JWT token refresh endpoint (useful for keeping users logged in)
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Google OAuth authentication
    path('google/register/', GoogleAuthRegisterView.as_view(), name='google_register'),
    path('google/login/', GoogleAuthLoginView.as_view(), name='google_login'),
]
