const axios = require('axios');

const API_URL = 'https://en.wikipedia.org/w/api.php';
const USER_AGENT = 'AIVoiceAssistant';

const getWiki = async (query) => {
    if (!query) throw new Error('Missing search query');
    if (typeof query !== 'string') throw new Error('Invalid search query, expected a string');

    // checking if wiki article exists for the given keywords
    try {
        const searchResp = await axios.get(API_URL, {
            params: {
                action: 'query',
                list: 'search',
                srsearch: query,
                srlimit: 1,
                format: 'json',
                origin: '*'
            },
            headers: { 'User-Agent': USER_AGENT }
        });

        const searchResults = searchResp.data && searchResp.data.query && searchResp.data.query.search;
        if (!searchResults || searchResults.length === 0) {
            throw new Error('No wiki page found for query');
        }
        // if wiki page is found, take first result and fetch its extract
        const title = searchResults[0].title;

        // only takes 2 sentences of the extract, can tune later if needed
        const extractResp = await axios.get(API_URL, {
            params: {
                action: 'query',
                prop: 'extracts',
                exintro: 1,
                explaintext: 1,
                exsentences: 2,
                titles: title,
                format: 'json',
                origin: '*'
            },
            headers: { 'User-Agent': USER_AGENT }
        });

        const pages = extractResp.data && extractResp.data.query && extractResp.data.query.pages;
        const pageId = pages && Object.keys(pages)[0];
        const extract = pages && pages[pageId] && pages[pageId].extract;

        if (!extract) {
            throw new Error('No extract available for page');
        }

        return { title, extract };
    } catch (error) {
        if (error.response) {
            throw new Error(`Wikimedia API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            throw new Error(`No response from Wikimedia API: ${String(error.request)}`);
        } else {
            throw new Error(`Wiki Adapter Error: ${error.message}`);
        }
    }
};

module.exports = { getWiki };