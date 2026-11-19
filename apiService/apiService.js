const { getWeather } = require('./apis/weatherAPI');
const { getNews } = require('./apis/newsAPI');
const { getWiki } = require('./apis/wikiAPI');


const fetchWeatherData = async (address, temperatureUnit = 'celsius') => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`

    try {
        const response = await fetch(url);
        const coords = await response.json();
        if (coords.length === 0) throw new Error("Geocoding error: Location not found");
        const data =  await getWeather(coords[0].lat, coords[0].lon, temperatureUnit);
        return {...data, location: coords[0].display_name};
    } catch (error) {
        throw new Error(error);
    }
}


const fetchNewsData = async (keywords) => {
    try {
        const data = await getNews(keywords);
        if (data.data.length == 0) {
            throw new Error("No articles found")
        }
        return data.data
    } catch (error) {
        throw new Error(error);
    }
}

const fetchWikiExtract = async (query) => {
    try {
        const data = await getWiki(query);
        return data;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {
    fetchWeatherData, fetchNewsData, fetchWikiExtract
};