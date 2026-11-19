from rest_framework import status
from rest_framework.test import APITestCase
from .models import WeatherAPI
from datetime import datetime

# Create your tests here.
class WeatherAPITestCase(APITestCase):
    def setUp(self):
        self.weather = {
            "location": "New York",
            "latitude": 40.7128,
            "longitude": -74.0060,
            "temp": 22.5,
            "humid": 60,
            "wind_speed": 5.2,
            "response_data": {"forecast": "Clear sky"}
        }
        self.url = '/api/weather/'

    def test_weather_creation(self):
        response = self.client.post(self.url, self.weather, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['location'], self.weather['location'])
        self.assertEqual(response.data['temp'], self.weather['temp'])

    def test_get_weather_list(self):
        WeatherAPI.objects.create(**self.weather)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
