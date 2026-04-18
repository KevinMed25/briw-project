FROM solr:9.4

# Create the core directory
USER root
RUN mkdir -p /var/solr/data/search_core/conf
RUN chown -R solr:solr /var/solr/data/search_core

USER solr

# Copy configuration files
COPY --chown=solr:solr ./configsets/search_config/conf /var/solr/data/search_core/conf

# Create the core.properties file
RUN echo "name=search_core" > /var/solr/data/search_core/core.properties
