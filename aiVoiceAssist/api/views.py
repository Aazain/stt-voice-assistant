from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.http import JsonResponse
from .process_voice import analyze_voice
from rest_framework.views import APIView
from .models import WeatherAPI, UserProfile
from .serializer import WeatherAPISerializer
import json


@api_view(['GET'])
def health_check(request):
    return Response({"status": "OK"})

# Create a new WeatherAPI instance
@api_view(['POST'])
def create_weather(request):
    if request.method == 'POST':
        serializer = WeatherAPISerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Get list of all WeatherAPI records
class WeatherAPIList(APIView):
    def get(self, request):
        weather_data = WeatherAPI.objects.all()
        serializer = WeatherAPISerializer(weather_data, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WeatherAPISerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            weather = WeatherAPI.objects.get(pk=pk)  # Retrieve the record by primary key
            weather.delete()  # Delete the record
            return Response({"message": "Weather record deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except WeatherAPI.DoesNotExist:
            return Response({"error": "Weather record not found."}, status=status.HTTP_404_NOT_FOUND)
        
    # Retrieve a specific WeatherAPI record
class WeatherDetailAPIView(APIView):
    def get(self, request, pk):
        weather = WeatherAPI.objects.get(id=pk)
        serializer = WeatherAPISerializer(weather)
        return Response(serializer.data)
    
    def put(self, request, pk):
        try:
            weather = WeatherAPI.objects.get(id=pk)
        except WeatherAPI.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = WeatherAPISerializer(weather, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    # DELETE method to delete a specific weather record
    def delete(self, request, pk):
        try:
            weather = WeatherAPI.objects.get(id=pk)
        except WeatherAPI.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        weather.delete()
        return Response({"detail": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

@csrf_exempt
def process_voice_view(request):
    print('test')
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))
        transcription = data.get("transcription")
        print(transcription)
        result = analyze_voice(transcription)
        return JsonResponse(result)


# User Profile
@csrf_exempt
def create_preferences(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')

        if not User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'User not found'}, status=404)

        user = User.objects.get(username=username)

        profile, created = UserProfile.objects.get_or_create(user=user)
        if not created:
            return JsonResponse({'error': 'Preferences already exist'}, status=400)

        profile.location = data.get('location', '')
        profile.theme = data.get('theme', 'light')
        profile.language = data.get('language', 'en')
        profile.save()

        return JsonResponse({'message': 'Preferences created successfully'})

    return JsonResponse({'error': 'Only POST allowed'}, status=405)

@csrf_exempt
def get_preferences(request):
    if request.method == 'GET':
        username = request.GET.get('username')

        try:
            user = User.objects.get(username=username)
            profile = user.userprofile
            return JsonResponse({
                'username': user.username,
                'location': profile.location,
                'theme': profile.theme,
                'language': profile.language
            })
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'Preferences not found'}, status=404)

    return JsonResponse({'error': 'Only GET allowed'}, status=405)

@csrf_exempt
def update_preferences(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        username = data.get('username')

        try:
            user = User.objects.get(username=username)
            profile = user.userprofile
            profile.location = data.get('location', profile.location)
            profile.theme = data.get('theme', profile.theme)
            profile.language = data.get('language', profile.language)
            profile.save()

            return JsonResponse({'message': 'Preferences updated successfully'})

        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'Preferences not found'}, status=404)

    return JsonResponse({'error': 'Only PUT allowed'}, status=405)

@csrf_exempt
def delete_preferences(request):
    if request.method == 'DELETE':
        data = json.loads(request.body)
        username = data.get('username')

        try:
            user = User.objects.get(username=username)
            profile = user.userprofile
            profile.delete()
            return JsonResponse({'message': 'Preferences deleted successfully'})
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        except UserProfile.DoesNotExist:
            return JsonResponse({'error': 'Preferences not found'}, status=404)

    return JsonResponse({'error': 'Only DELETE allowed'}, status=405)