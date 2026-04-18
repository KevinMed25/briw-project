const axios = require('axios');

const TIKA_URL = process.env.TIKA_URL || 'http://tika:9998';

class TikaService {
    async extractText(fileBuffer, mimeType) {
        try {
            const response = await axios.put(`${TIKA_URL}/tika`, fileBuffer, {
                headers: {
                    'Accept': 'text/plain',
                    'Content-Type': mimeType
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            });
            return response.data;
        } catch (error) {
            console.error('Tika Extraction Error:', error.message);
            throw new Error('Failed to process document');
        }
    }
}

module.exports = new TikaService();
