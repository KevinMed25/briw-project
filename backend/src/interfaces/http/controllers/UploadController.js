const tikaService = require('../../../infrastructure/tika/TikaService');
const solrAdapter = require('../../../infrastructure/solr/SolrAdapter');

class UploadController {
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            const mimeType = req.file.mimetype;

            // 1. Extract text with Tika
            const textContent = await tikaService.extractText(fileBuffer, mimeType);

            if (!textContent || !textContent.trim()) {
                return res.status(422).json({ error: 'Could not extract text from file' });
            }

            // 2. Index in Solr
            const doc = {
                id: `file_${Date.now()}_${fileName}`,
                title: fileName,
                content: textContent,
                file_type: 'document',
                category: 'upload',
                url: `local://${fileName}`,
                last_modified: new Date().toISOString()
            };

            await solrAdapter.indexDocument(doc);

            res.json({ message: 'File uploaded and indexed successfully', docId: doc.id });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UploadController();
