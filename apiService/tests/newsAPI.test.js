const { getNews } = require('../apis/newsAPI');
const axios = require('axios');

jest.mock('axios');

describe('getNews', () => {
    it('should return news data for a single keyword', async () => {
        const mockKeyword = 'technology';
        const mockResponse = {
            data: {
                data: [
                    { title: 'Tech News 1', description: 'Desc 1' },
                    { title: 'Tech News 2', description: 'Desc 2' }
                ]
            }
        };

        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await getNews(mockKeyword);

        expect(result).toEqual(mockResponse.data);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('http://api.mediastack.com/v1/news'),
            expect.objectContaining({
                params: expect.objectContaining({
                    keywords: mockKeyword,
                    limit: 10,
                    languages: "en"
                })
            })
        );
    });

    it('should return news data for an array of keywords', async () => {
        const mockKeywords = ['technology', 'science'];
        const mockResponse = {
            data: {
                data: [
                    { title: 'Tech & Science News', description: 'Desc' }
                ]
            }
        };

        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await getNews(mockKeywords);

        expect(result).toEqual(mockResponse.data);
        expect(axios.get).toHaveBeenCalledWith(
            expect.stringContaining('http://api.mediastack.com/v1/news'),
            expect.objectContaining({
                params: expect.objectContaining({
                    keywords: mockKeywords.join(','),
                    limit: 10,
                    languages: "en"
                })
            })
        );
    });

    it('should throw an error if API returns an error', async () => {
        const mockKeyword = 'technology';

        axios.get.mockRejectedValueOnce({
            response: { status: 401, data: { reason: "Invalid API key" } }
        });

        await expect(getNews(mockKeyword)).rejects.toThrow('API Error 401: "Invalid API key"');
    });

    it('should throw an error if no response from the API', async () => {
        const mockKeyword = 'technology';

        axios.get.mockRejectedValueOnce({
            request: {}
        });

        await expect(getNews(mockKeyword)).rejects.toThrow('No response from API: [object Object]');
    });

    it('should throw an error for other axios errors', async () => {
        const mockKeyword = 'technology';

        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        await expect(getNews(mockKeyword)).rejects.toThrow('Axios Error: Network Error');
    });
});