const axios = require('axios');
const config = require('../../config');

class SolrAdapter {
    constructor() {
        this.client = axios.create({
            baseURL: config.solrUrl
        });
    }

    async search(query, params = {}) {
        try {
            const solrParams = new URLSearchParams();
            solrParams.append('q', query);
            solrParams.append('wt', 'json');
            solrParams.append('defType', 'edismax');
            solrParams.append('qf', 'title^2.0 content^1.0');
            solrParams.append('rows', params.rows || 10);
            solrParams.append('start', params.start || 0);
            solrParams.append('hl', 'true');
            solrParams.append('hl.fl', 'title,content');
            solrParams.append('hl.simple.pre', '<em>');
            solrParams.append('hl.simple.post', '</em>');
            solrParams.append('facet', 'true');
            solrParams.append('facet.field', 'category');
            solrParams.append('facet.field', 'file_type');
            solrParams.append('spellcheck', 'true');

            if (params.filters) {
                Object.entries(params.filters).forEach(([field, value]) => {
                    solrParams.append('fq', `${field}:"${value}"`);
                });
            }

            const response = await this.client.get('/select', { params: solrParams });
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error('Solr Error Data:', JSON.stringify(error.response.data, null, 2));
            }
            console.error('Solr Search Error:', error.message);
            throw new Error('Error connecting to search engine');
        }
    }

    async suggest(query) {
        try {
            const response = await this.client.get('/suggest', {
                params: {
                    suggest: 'true',
                    'suggest.build': 'true',
                    'suggest.dictionary': 'mySuggester',
                    'suggest.q': query
                }
            });
            return response.data;
        } catch (error) {
            console.error('Solr Suggest Error:', error.message);
            return {};
        }
    }
    async indexDocument(doc) {
        try {
            await this.client.post('/update/json/docs', doc, {
                params: { commit: 'true' }
            });
        } catch (error) {
            console.error('Solr Indexing Error:', error.message);
            throw new Error('Failed to index document');
        }
    }

    async clearIndex() {
        try {
            await this.client.post('/update', { delete: { query: '*:*' } }, {
                params: { commit: 'true' }
            });
        } catch (error) {
            console.error('Solr Clear Index Error:', error.message);
            throw new Error('Failed to clear index');
        }
    }
}

module.exports = new SolrAdapter();
