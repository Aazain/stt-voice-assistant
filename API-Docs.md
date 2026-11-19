# API Documentation
This file outlines all API's used by the application, as well as instructions for utilizing `apiService`

## Weather API ([Open-Meteo](https://open-meteo.com/))
[API Documentation](https://open-meteo.com/en/docs)
- Free
- No API key required
- Up to 10,000 daily API calls
- Requires a geocoding service (e.g., OpenStreetMap) to retrieve the latitude and longitude of a location.
- Successful requests are returned as a JSON object (format is outlined in the API documentation)
- Bad requests are returned as a JSON object in the following format:
```json
{
 "error": true,
 "reason": "Description of the error"
}
```

## News API ([mediastack](https://mediastack.com/))
[Documentation](https://mediastack.com/documentation)
- Requires an API key
- Limited to 100 request per month
- Both articles & errors are returned as JSON objects

## Wiki API ([Wikimedia Action API](https://www.mediawiki.org/))
[Documentation](https://www.mediawiki.org/wiki/API:Action_API)
- No API key required
- Used to search for Wikipedia articles and retrieve plain-text summaries
- Returns the article title and a short extract

## Using `apiService`
The `apiService` module provides a unified interface for interacting with the Weather API, News API, and Wiki API (and any others that may be added in the future). It currently contains the following functions:

### `fetchWeatherData(address, temperatureUnit = 'celsius')`
- **Description:** Fetches weather data for a given address
- **Parameters:**
  - `address` (string): The location to fetch weather data for
  - `temperatureUnit` (string, optional): The temperature unit (`'celsius'` or `'fahrenheit'`). Defaults to `'celsius'`
- **Returns:** A JSON object containing weather data and the location name
- **Example:**
```javascript
// NOTE: omitting try/catch blocks for simplicity, you will still need to account for error responses!
const { fetchWeatherData } = require('./apiService');
fetchWeatherData('Toronto, Canada').then(data => console.log(data));
```
- **Sample Response:**
```json
{
  "location": "Toronto, Ontario, Canada",
  "temperature": 22,
  "temperatureUnit": "C",
  "condition": "Partly Cloudy",
  "windspeed": 15
}
```

### `fetchNewsData(keywords)`
- **Description:** Fetches news articles based on the provided keywords
- **Parameters:**
  - `keywords` (string/array of strings): The keywords to search for 
- **Returns:** A JSON object containing a list of news articles
- **Example:**
```javascript
const { fetchNewsData } = require('./apiService');
fetchNewsData('technology').then(data => console.log(data));
fetchNewsData(['technology', 'science']).then(data => console.log(data));
```
- **Sample Response:**
```json
[
  {
    "author": "John Doe",
    "title": "The Future of Technology",
    "description": "An in-depth look at the latest advancements in technology.",
    "url": "https://example.com/future-of-technology",
    "source": "Tech News Daily",
    "image": "https://example.com/image.jpg",
    "category": "technology",
    "language": "en",
    "country": "us",
    "published_at": "2025-10-14T10:00:00Z"
  },
  {
    "author": "Jane Smith",
    "title": "Science and Innovation",
    "description": "How science is driving innovation in the modern world.",
    "url": "https://example.com/science-innovation",
    "source": "Science Weekly",
    "image": "https://example.com/image2.jpg",
    "category": "science",
    "language": "en",
    "country": "us",
    "published_at": "2025-11-10T15:30:00Z"
  }
]
```

### ```fetchWikiExtract(query)```
- **Description:** Fetches a Wikipedia article summary for the given query
- **Parameters:**
  - `query` (string/array of strings): The keywords to search for 
- **Returns:** A JSON object containing the article title and extract
- **Example:**
```javascript
const { fetchWikiExtract } = require('./apiService');
fetchWikiExtract('Leonardo DiCaprio').then(data => console.log(data));
```
- **Sample Response:**
```json
{
    "title": "Leonardo DiCaprio",
    "extract": "Leonardo Wilhelm DiCaprio is an American actor and film producer. Known for..."
}
```

## Notes
- Ensure the `.env` file contains the required API keys:
```
NEWS_API_KEY=your_news_api_key
```
