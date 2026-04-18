const solrAdapter = require('../infrastructure/solr/SolrAdapter');

class SearchService {
    async executeSearch(query, options = {}) {
        // Basic query cleaning
        let cleanQuery = query.trim();
        if (!cleanQuery) cleanQuery = '*:*';

        // Apply boolean logic if needed (simple implementation)
        // Solr edismax handles most operators (AND, OR, NOT) natively if passed in the query string

        const results = await solrAdapter.search(cleanQuery, options);

        // Fetch suggestions if results are empty or low, or always
        let suggestions = [];
        if (results.response.numFound === 0 && cleanQuery !== '*:*') {
            suggestions = await this.getSuggestions(cleanQuery);
        }

        return this._formatResponse(results, suggestions);
    }

    async getSuggestions(query) {
        if (!query) return [];
        const rawSuggestions = await solrAdapter.suggest(query);

        // Parse Solr suggest response
        const suggestions = [];
        if (rawSuggestions.suggest && rawSuggestions.suggest.mySuggester && rawSuggestions.suggest.mySuggester[query]) {
            rawSuggestions.suggest.mySuggester[query].suggestions.forEach(s => {
                suggestions.push(s.term);
            });
        }
        return suggestions;
    }

    _formatResponse(solrResponse, externalSuggestions = []) {
        const docs = solrResponse.response.docs;
        const highlighting = solrResponse.highlighting || {};
        const facets = solrResponse.facet_counts ? solrResponse.facet_counts.facet_fields : {};
        const spellcheck = solrResponse.spellcheck ? solrResponse.spellcheck.suggestions : [];

        // Merge highlighting into docs
        const formattedDocs = docs.map(doc => {
            const hl = highlighting[doc.id] || {};
            return {
                ...doc,
                title_hl: hl.title ? hl.title[0] : doc.title,
                content_hl: hl.content ? hl.content[0] : (doc.content ? doc.content.substring(0, 200) + '...' : '')
            };
        });

        // Format spellcheck
        let didYouMean = null;
        if (spellcheck.length > 0) {
            // Simple extraction of the first collation or suggestion
            // Solr structure: [term, {numFound: x, startOffset: y, endOffset: z, suggestion: []}]
            // Or collation: [collation, {collationQuery: "..."}]
            for (let i = 0; i < spellcheck.length; i++) {
                if (spellcheck[i] === 'collation') {
                    didYouMean = spellcheck[i + 1].collationQuery;
                    break;
                }
            }
        }

        // Fallback to external suggestions (Suggester)
        if (!didYouMean && externalSuggestions.length > 0) {
            didYouMean = externalSuggestions[0];
        }

        return {
            total: solrResponse.response.numFound,
            results: formattedDocs,
            facets: facets,
            didYouMean: didYouMean
        };
    }
    async clearIndex() {
        await solrAdapter.clearIndex();
        return { message: 'Index cleared successfully' };
    }
}

module.exports = new SearchService();
