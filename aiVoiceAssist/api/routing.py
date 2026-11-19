from django.urls import re_path
from .consumer import VoiceAssistantConsumer

websocket_urlpatterns = [
    re_path(r'ws/voice/$', VoiceAssistantConsumer.as_asgi()),
]