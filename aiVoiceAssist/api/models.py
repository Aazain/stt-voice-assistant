from django.db import models
from django.contrib.auth.models import User

# Create your models here.
# UserProfile
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=100, blank=True)
    theme = models.CharField(max_length=10, default='light')
    language = models.CharField(max_length=10, default='en')

    def __str__(self):
        return f"{self.user.username}'s profile"

# Weather models
class WeatherAPI(models.Model):
    location = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    temp = models.FloatField()
    humid = models.FloatField()
    wind_speed = models.FloatField()
    time = models.DateTimeField(auto_now_add=True)
    response_data = models.JSONField()

    def __str__(self):
        return f"Weather for {self.location} at {self.time}" 

# New models
class NewsAPI(models.Model):
    source = models.CharField(max_length=255, null=True, blank=True)
    title = models.CharField(max_length=400)
    desc = models.TextField(null=True, blank =True)
    url = models.URLField()
    publish_time = models.DateTimeField()
    category = models.CharField(max_length=100, null=True, blank=True)
    time = models.DateTimeField(auto_now_add=True)
    response_data = models.JSONField()

    def __str__(self):
        return f"News request at {self.time}" 

# logging control actions model for debugging if needed
class MediaControlAction(models.Model):
    actions = models.CharField(max_length=50, choices=[
        ('volumemute', 'Mute'),
        ('playpause', 'Play/Pause'),
        ('volumeup', 'Volume Up'),
        ('volumedown', 'Volume Down'),
        ('nexttrack', 'Next Track'),
        ('previoustrack', 'Previous Track')
    ])
    time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Media action: {self.actions} at {self.time}"