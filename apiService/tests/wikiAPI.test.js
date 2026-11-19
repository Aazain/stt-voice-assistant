const axios = require('axios');
const { getWiki } = require('../apis/wikiAPI');

jest.mock('axios');

describe('getWiki', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns Wikipedia summary data for a valid query', async () => {
        const mockQuery = 'Leonardo DiCaprio';
        const searchResp = {
            data: {
                query: {
                    search: [{ title: 'Leonardo DiCaprio' }]
                }
            }
        };
        const extractResp = {
            data: {
                query: {
                    pages: {
                        '736': { extract: 'Leonardo Wilhelm DiCaprio ( ; Italian: [diˈkaːprjo]; born November 11, 1974) is an American...' }
                    }
                }
            }
        };

        axios.get.mockResolvedValueOnce(searchResp);
        axios.get.mockResolvedValueOnce(extractResp);  

        const result = await getWiki(mockQuery);

        expect(result).toEqual({
            title: 'Leonardo DiCaprio',
            extract: 'Leonardo Wilhelm DiCaprio ( ; Italian: [diˈkaːprjo]; born November 11, 1974) is an American...'
        });

        expect(axios.get).toHaveBeenCalledTimes(2);
        expect(axios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            params: expect.objectContaining({ list: 'search', srsearch: mockQuery })
        }));
        expect(axios.get).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({
            params: expect.objectContaining({ prop: 'extracts', titles: 'Leonardo DiCaprio' })
        }));
    });

    it('throws when non-string input is provided', async () => {
        await expect(getWiki(['Leonardo', 'DiCaprio'])).rejects.toThrow('Invalid search query, expected a string');
        await expect(getWiki(12345)).rejects.toThrow('Invalid search query, expected a string');
        await expect(getWiki({ name: 'Leonardo DiCaprio' })).rejects.toThrow('Invalid search query, expected a string');
    });
    it('throws when no input is provided', async () => {
        await expect(getWiki()).rejects.toThrow('Missing search query');
        await expect(getWiki(null)).rejects.toThrow('Missing search query');
        await expect(getWiki('')).rejects.toThrow('Missing search query');
    });

    it('throws an error when no wiki page is found', async () => {
        const mockQuery = 'asldkfjalskdfj';
        const searchResp = {
            data: {
                query: {
                    search: []
                }
            }
        };

        axios.get.mockResolvedValueOnce(searchResp);

        await expect(getWiki(mockQuery)).rejects.toThrow('No wiki page found for query');
    });

    it('throws if no extract is found for the page', async () => {
        axios.get.mockResolvedValueOnce({
            data: { query: { search: [{ title: 'Leonardo DiCaprio' }] } }
        });
        axios.get.mockResolvedValueOnce({
            data: { query: { pages: { '1': {} } } }
        });

        await expect(getWiki('Leonardo DiCaprio')).rejects.toThrow('No extract available for page');
        expect(axios.get).toHaveBeenCalledTimes(2);
    });
        

    it('throws an error when the API call fails', async () => {
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        await expect(getWiki('Leonardo DiCaprio')).rejects.toThrow('Network Error');
        expect(axios.get).toHaveBeenCalled();
    });
});