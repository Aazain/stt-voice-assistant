const { fetchWeatherData, fetchNewsData, fetchWikiExtract } = require('../apiService');
const { getWeather } = require('../apis/weatherAPI');
const { getNews } = require('../apis/newsAPI');
const { getWiki } = require('../apis/wikiAPI');



jest.mock('../apis/weatherAPI', () => ({
    getWeather: jest.fn()
}));
jest.mock('../apis/newsAPI', () => ({
    getNews: jest.fn()
}));

jest.mock('../apis/wikiAPI', () => ({
    getWiki: jest.fn()
}));


global.fetch = jest.fn();

describe('fetchWeatherData', () => {
    it('should return weather data and location for valid address', async () => {
        const mockAddress = 'Toronto';
        const mockCoords = [{
            lat: 43.7,
            lon: -79.42,
            display_name: 'Toronto, Ontario, Canada'
        }];
        const mockWeatherData = {
            temperature: 15,
            condition: "Clear sky",
            windspeed: 5
        };

        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockCoords)
        });

        getWeather.mockResolvedValueOnce(mockWeatherData);

        const result = await fetchWeatherData(mockAddress);

        expect(result).toEqual({
            ...mockWeatherData,
            location: mockCoords[0].display_name
        });

        expect(fetch).toHaveBeenCalledWith(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mockAddress)}`);
        expect(getWeather).toHaveBeenCalledWith(mockCoords[0].lat, mockCoords[0].lon, 'celsius');
    });

    it('should use celsius as default temperature unit when not specified', async () => {
        const mockAddress = 'Toronto';
        const mockCoords = [{
            lat: 43.7,
            lon: -79.42,
            display_name: 'Toronto, Ontario, Canada'
        }];
        const mockWeatherData = {
            temperature: 15,
            condition: "Clear sky",
            windspeed: 5
        };

        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockCoords)
        });

        getWeather.mockResolvedValueOnce(mockWeatherData);

        await fetchWeatherData(mockAddress);

        expect(getWeather).toHaveBeenCalledWith(mockCoords[0].lat, mockCoords[0].lon, 'celsius');
    });

    it('should pass fahrenheit as temperature unit when specified', async () => {
        const mockAddress = 'Toronto';
        const mockCoords = [{
            lat: 43.7,
            lon: -79.42,
            display_name: 'Toronto, Ontario, Canada'
        }];
        const mockWeatherData = {
            temperature: 59,
            condition: "Clear sky",
            windspeed: 5
        };

        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockCoords)
        });

        getWeather.mockResolvedValueOnce(mockWeatherData);

        const result = await fetchWeatherData(mockAddress, 'fahrenheit');

        expect(result).toEqual({
            ...mockWeatherData,
            location: mockCoords[0].display_name
        });

        expect(getWeather).toHaveBeenCalledWith(mockCoords[0].lat, mockCoords[0].lon, 'fahrenheit');
    });

    it('should throw an error if location is not found', async () => {
        const mockAddress = 'Unknown Location';
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce([])
        });

        await expect(fetchWeatherData(mockAddress)).rejects.toThrow('Geocoding error: Location not found');
    });

    it('should throw an error if there is an issue with fetching weather data', async () => {
        const mockAddress = 'Toronto';
        const mockCoords = [{
            lat: 43.7,
            lon: -79.42,
            display_name: 'Toronto, Ontario, Canada'
        }];
        fetch.mockResolvedValueOnce({
            json: jest.fn().mockResolvedValueOnce(mockCoords)
        });

        getWeather.mockRejectedValueOnce(new Error('API Error'));

        await expect(fetchWeatherData(mockAddress)).rejects.toThrow('API Error');
    });
});

describe('fetchNewsData', () => {
    it('should return articles for valid keywords', async () => {
        const mockKeywords = 'technology';
        const mockNewsData = {
            data: [
                { title: 'Tech News 1', description: 'Desc 1' },
                { title: 'Tech News 2', description: 'Desc 2' }
            ]
        };

        getNews.mockResolvedValueOnce({ data: mockNewsData.data });

        const result = await fetchNewsData(mockKeywords);

        expect(result).toEqual(mockNewsData.data);
        expect(getNews).toHaveBeenCalledWith(mockKeywords);
    });

    it('should throw an error if no articles are found', async () => {
        const mockKeywords = 'unknown';
        getNews.mockResolvedValueOnce({ data: [] });

        await expect(fetchNewsData(mockKeywords)).rejects.toThrow('No articles found');
    });

    it('should throw an error if getNews throws', async () => {
        const mockKeywords = 'technology';
        getNews.mockRejectedValueOnce(new Error('API Error'));

        await expect(fetchNewsData(mockKeywords)).rejects.toThrow('API Error');
    });
});

describe('fetchWikiExtract', () => {
    it('should return wiki extract for valid query', async () => {
        const mockQuery = 'JavaScript';
        const mockWikiData = {
            title: 'JavaScript',
            extract: 'JavaScript is a programming language...'
        };

        getWiki.mockResolvedValueOnce(mockWikiData);

        const result = await fetchWikiExtract(mockQuery);

        expect(result).toEqual(mockWikiData);
        expect(getWiki).toHaveBeenCalledWith(mockQuery);
    });

    it('should throw an error if getWiki throws', async () => {
        const mockQuery = 'JavaScript';
        getWiki.mockRejectedValueOnce(new Error('API Error'));

        await expect(fetchWikiExtract(mockQuery)).rejects.toThrow('API Error');
    });
});