import os
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from processor import process_document
from indexer import SolrIndexer

# Configuration
SEEDS = [
    "https://es.wikipedia.org/wiki/Apache_Solr",
    "https://es.wikipedia.org/wiki/Buscador",
    "https://es.wikipedia.org/wiki/Recuperaci%C3%B3n_de_informaci%C3%B3n"
]
MAX_DEPTH = 1
SOLR_URL = os.getenv("SOLR_URL", "http://localhost:8983/solr/search_core")
TIKA_URL = os.getenv("TIKA_URL", "http://localhost:9998")

visited = set()
indexer = SolrIndexer(SOLR_URL)

def is_valid_url(url):
    parsed = urlparse(url)
    return bool(parsed.netloc) and bool(parsed.scheme)

def crawl(url, depth):
    if depth > MAX_DEPTH or url in visited:
        return
    
    print(f"Crawling: {url}")
    visited.add(url)

    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        content_type = response.headers.get('Content-Type', '').lower()
        print(f"URL: {url}, Status: {response.status_code}, Type: {content_type}")

        if 'text/html' in content_type:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract content
            title = soup.title.string if soup.title else url
            text = soup.get_text(separator=' ', strip=True)
            
            doc = {
                "id": url,
                "title": title,
                "content": text,
                "url": url,
                "file_type": "html",
                "category": "web",
                "last_modified": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            indexer.index_document(doc)

            # Find links
            if depth < MAX_DEPTH:
                for link in soup.find_all('a', href=True):
                    next_url = urljoin(url, link['href'])
                    if is_valid_url(next_url):
                        crawl(next_url, depth + 1)

        elif 'application/pdf' in content_type or 'application/msword' in content_type:
            # Send to Tika processor
            print(f"Found document: {url}")
            text_content = process_document(response.content, TIKA_URL)
            if text_content:
                doc = {
                    "id": url,
                    "title": os.path.basename(urlparse(url).path),
                    "content": text_content,
                    "url": url,
                    "file_type": "document",
                    "category": "file",
                    "last_modified": time.strftime("%Y-%m-%dT%H:%M:%SZ")
                }
                indexer.index_document(doc)

    except Exception as e:
        print(f"Error crawling {url}: {e}")

if __name__ == "__main__":
    # Wait for Solr to be ready
    print("Waiting for Solr...")
    time.sleep(10) 
    
    for seed in SEEDS:
        crawl(seed, 0)
    
    indexer.commit()
    print("Crawling finished.")
