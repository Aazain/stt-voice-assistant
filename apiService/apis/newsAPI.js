require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.NEWS_API_KEY;
const API_URL = `http://api.mediastack.com/v1/news`


const getNews = async (keywords) => {
    const keywordQuery = Array.isArray(keywords) ? keywords.join(',') : keywords;

    try {
        const { data } = await axios.get(API_URL, {

            params: {
                access_key: apiKey,
                keywords: keywordQuery,
                limit: 4,
                languages: "en"
            }

        })
        return data;
    } catch (error) {
        if (error.response) {
            throw new Error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data.reason)}`);
        } else if (error.request) {
            throw new Error(`No response from API: ${error.request}`);
        } else {
            throw new Error(`Axios Error: ${error.message}`);
        }
    }

    
}


module.exports = { getNews }
