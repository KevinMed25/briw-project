const fs = require('fs');
const path = require('path');
const tikaService = require('../../../infrastructure/tika/TikaService');
const solrAdapter = require('../../../infrastructure/solr/SolrAdapter');
const config = require('../../../config');

class UploadController {
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            const mimeType = req.file.mimetype;

            // 1. Save file to disk
            const uploadsDir = path.join(__dirname, '../../../../uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filePath = path.join(uploadsDir, fileName);
            fs.writeFileSync(filePath, fileBuffer);

            // 2. Extract text with Tika
            const textContent = await tikaService.extractText(fileBuffer, mimeType);

            if (!textContent || !textContent.trim()) {
                return res.status(422).json({ error: 'Could not extract text from file' });
            }

            // 3. Index in Solr
            // Use the public URL for the file
            const publicUrl = `http://localhost:5001/uploads/${fileName}`;

            const doc = {
                id: `file_${Date.now()}_${fileName}`,
                title: fileName,
                content: textContent,
                file_type: 'document',
                category: 'upload',
                url: publicUrl,
                last_modified: new Date().toISOString()
            };

            await solrAdapter.indexDocument(doc);

            res.json({ message: 'File uploaded and indexed successfully', docId: doc.id, url: publicUrl });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UploadController();
