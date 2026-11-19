from rest_framework import serializers
from .models import WeatherAPI

class WeatherAPISerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherAPI
        fields = '__all__'
