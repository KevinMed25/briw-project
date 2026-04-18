import os
import time
import requests
import threading
from flask import Flask, jsonify
from flask_cors import CORS
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from processor import process_document
from indexer import SolrIndexer

app = Flask(__name__)
CORS(app)

# Configuration
API_URL = os.getenv("API_URL", "http://localhost:3000/api")
MAX_DEPTH = 1
SOLR_URL = os.getenv("SOLR_URL", "http://localhost:8983/solr/search_core")
TIKA_URL = os.getenv("TIKA_URL", "http://localhost:9998")

visited = set()
indexer = SolrIndexer(SOLR_URL)
is_crawling = False

def get_seeds():
    try:
        # Use API_URL from environment
        url = f"{API_URL}/crawler/seeds"
        print(f"Fetching seeds from {url}...")
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            seeds = response.json()
            print(f"Loaded {len(seeds)} seeds from API.")
            return seeds
        else:
            print(f"Failed to fetch seeds: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching seeds: {e}")
        return []

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

def run_crawler_job():
    global is_crawling, visited
    is_crawling = True
    visited = set() # Reset visited for new run
    try:
        print("Starting crawler job...")
        seeds = get_seeds()
        if not seeds:
            print("No seeds found.")
        
        for seed in seeds:
            crawl(seed, 0)
        
        indexer.commit()
        print("Crawling finished.")
    except Exception as e:
        print(f"Crawler job failed: {e}")
    finally:
        is_crawling = False

@app.route('/crawl', methods=['POST'])
def trigger_crawl():
    global is_crawling
    if is_crawling:
        return jsonify({"message": "Crawler is already running"}), 409
    
    thread = threading.Thread(target=run_crawler_job)
    thread.start()
    return jsonify({"message": "Crawler started"}), 202

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "crawling": is_crawling})

if __name__ == "__main__":
    # Wait for Solr to be ready
    print("Waiting for Solr...")
    time.sleep(10) 
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5000)
