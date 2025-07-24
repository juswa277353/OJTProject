from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdmin, IsClient, IsGuest
from .serializers import CustomUserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

# User Registration View
class RegisterView(APIView):
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# User Detail View (to retrieve user info, including id)
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)

# Example Views for Role-Based Access
class AdminView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({"message": "Welcome, Admin! You have access to admin features."})

class ClientView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def get(self, request):
        return Response({"message": "Welcome, Client! You have access to client features."})

class GuestView(APIView):
    permission_classes = [IsAuthenticated, IsGuest]

    def get(self, request):
        return Response({"message": "Welcome, Guest! You have limited access."})
