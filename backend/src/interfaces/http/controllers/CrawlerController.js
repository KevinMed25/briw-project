const fs = require('fs').promises;
const path = require('path');

const SEEDS_FILE = path.join(__dirname, '../../../../seeds.txt');

class CrawlerController {
    async getSeeds(req, res) {
        try {
            try {
                const data = await fs.readFile(SEEDS_FILE, 'utf8');
                const seeds = data.split('\n').filter(line => line.trim() !== '');
                res.json(seeds);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    // File doesn't exist, return empty list or defaults
                    res.json([]);
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error('Error reading seeds:', error);
            res.status(500).json({ error: 'Failed to retrieve seeds' });
        }
    }

    async updateSeeds(req, res) {
        try {
            const { seeds } = req.body;
            if (!Array.isArray(seeds)) {
                return res.status(400).json({ error: 'Seeds must be an array of strings' });
            }

            const content = seeds.join('\n');
            await fs.writeFile(SEEDS_FILE, content, 'utf8');
            res.json({ message: 'Seeds updated successfully', count: seeds.length });
        } catch (error) {
            console.error('Error updating seeds:', error);
            res.status(500).json({ error: 'Failed to update seeds' });
        }
    }

    async runCrawler(req, res) {
        try {
            // Call the crawler service
            // Assuming crawler is running on port 5000 in the same network
            const axios = require('axios');
            const response = await axios.post('http://crawler:5000/crawl');
            res.json(response.data);
        } catch (error) {
            console.error('Error triggering crawler:', error.message);
            if (error.response) {
                res.status(error.response.status).json(error.response.data);
            } else {
                res.status(500).json({ error: 'Failed to trigger crawler' });
            }
        }
    }

    async getCrawlerStatus(req, res) {
        try {
            const axios = require('axios');
            // Short timeout for status check
            const response = await axios.get('http://crawler:5000/health', { timeout: 2000 });
            res.json(response.data);
        } catch (error) {
            // If crawler is down or unreachable, assume it's not crawling
            console.error('Error checking crawler status:', error.message);
            res.json({ status: 'unknown', crawling: false, error: error.message });
        }
    }
}

module.exports = new CrawlerController();
