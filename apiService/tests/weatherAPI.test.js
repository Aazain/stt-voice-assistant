const { getWeather } = require('../apis/weatherAPI');
const axios = require('axios');


jest.mock('axios');

describe('getWeather', () => {
    it('should return weather data for valid coordinates in celsius', async () => {
        const mockLat = 43.7;
        const mockLon = -79.42;
        const mockResponse = {
            data: {
                current: {
                    temperature_2m: 15,
                    weather_code: 0,
                    wind_speed_10m: 5
                }
            }
        };

        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await getWeather(mockLat, mockLon, 'celsius');

        expect(result).toEqual({
            temperature: 15,
            temperatureUnit: '°C',
            condition: "Clear sky",
            windspeed: 5
        });

        expect(axios.get).toHaveBeenCalledWith('https://api.open-meteo.com/v1/forecast?', expect.objectContaining({
            params: {
                latitude: mockLat,
                longitude: mockLon,
                current: expect.arrayContaining(["temperature_2m", "weather_code", "wind_speed_10m"]),
                temperature_unit: 'celsius'
            }
        }));
    });

    it('should return weather data in fahrenheit when specified', async () => {
        const mockLat = 43.7;
        const mockLon = -79.42;
        const mockResponse = {
            data: {
                current: {
                    temperature_2m: 59,
                    weather_code: 0,
                    wind_speed_10m: 5
                }
            }
        };

        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await getWeather(mockLat, mockLon, 'fahrenheit');

        expect(result).toEqual({
            temperature: 59,
            temperatureUnit: '°F',
            condition: "Clear sky",
            windspeed: 5
        });

        expect(axios.get).toHaveBeenCalledWith('https://api.open-meteo.com/v1/forecast?', expect.objectContaining({
            params: {
                latitude: mockLat,
                longitude: mockLon,
                current: expect.arrayContaining(["temperature_2m", "weather_code", "wind_speed_10m"]),
                temperature_unit: 'fahrenheit'
            }
        }));
    });

    it('should throw an error if API returns an error', async () => {
        const mockLat = 43.7;
        const mockLon = -79.42;

        axios.get.mockRejectedValueOnce({
            response: { status: 400, data: { reason: "Invalid request" } }
        });

        await expect(getWeather(mockLat, mockLon)).rejects.toThrow('API Error 400: "Invalid request"');
    });

    it('should throw an error if no response from the API', async () => {
        const mockLat = 43.7;
        const mockLon = -79.42;

        axios.get.mockRejectedValueOnce({
            request: {}
        });

        await expect(getWeather(mockLat, mockLon)).rejects.toThrow('No response from API: [object Object]');
    });

    it('should throw an error for other axios errors', async () => {
        const mockLat = 43.7;
        const mockLon = -79.42;

        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        await expect(getWeather(mockLat, mockLon)).rejects.toThrow('Axios Error: Network Error');
    });
});
