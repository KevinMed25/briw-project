const searchService = require('../../../domain/SearchService');

class SearchController {
    async search(req, res) {
        try {
            const { q, rows, start, filters } = req.query;
            let parsedFilters = {};
            if (filters) {
                try {
                    parsedFilters = JSON.parse(filters);
                } catch (e) {
                    console.error('Error parsing filters:', e);
                }
            }
            const results = await searchService.executeSearch(q, { rows, start, filters: parsedFilters });
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async suggest(req, res) {
        try {
            const { q } = req.query;
            const suggestions = await searchService.getSuggestions(q);
            res.json(suggestions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new SearchController();
