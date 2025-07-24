from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, AdminView, ClientView, GuestView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/', AdminView.as_view(), name='admin'),
    path('client/', ClientView.as_view(), name='client'),
    path('guest/', GuestView.as_view(), name='guest'),
]