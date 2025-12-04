import pysolr

class SolrIndexer:
    def __init__(self, solr_url):
        self.solr = pysolr.Solr(solr_url, always_commit=False)

    def index_document(self, doc):
        try:
            self.solr.add([doc])
            print(f"Indexed: {doc['title']}")
        except Exception as e:
            print(f"Error indexing document {doc['id']}: {e}")

    def commit(self):
        try:
            self.solr.commit()
            print("Commit successful.")
        except Exception as e:
            print(f"Error committing: {e}")
