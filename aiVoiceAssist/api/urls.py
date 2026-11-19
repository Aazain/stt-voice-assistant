from django.urls import path, include
from . import views

urlpatterns = [
    path('health/', views.health_check),
    path('process-voice/', views.process_voice_view, name='process-voice'),
    path('weather/', views.WeatherAPIList.as_view(), name='weather-list'),  
    path('weather/<int:pk>/', views.WeatherDetailAPIView.as_view(), name='weather-detail'),  
    path('weather/create/', views.create_weather, name='create-weather'),
    path('preferences/create/', views.create_preferences, name='create-preferences'),
    path('preferences/get/', views.get_preferences, name='get-preferences'),
    path('preferences/update/', views.update_preferences, name='update-preferences'),
    path('preferences/delete/', views.delete_preferences, name='delete-preferences'),
]