# backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('api.urls')), # Include your API authentication URLs here
    # Add other app URLs as needed, e.g., path('api/events/', include('events.urls')),
]
