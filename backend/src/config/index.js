require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  solrUrl: process.env.SOLR_URL || 'http://localhost:8983/solr/search_core'
};
