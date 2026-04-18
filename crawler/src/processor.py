import requests
from io import BytesIO

def process_document(content_bytes, tika_url):
    """
    Extracts text from binary content using Apache Tika.
    """
    try:
        headers = {'Accept': 'text/plain'}
        response = requests.put(f"{tika_url}/tika", data=content_bytes, headers=headers)
        
        if response.status_code == 200:
            return response.text
        else:
            print(f"Tika error: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error processing document: {e}")
        return None
