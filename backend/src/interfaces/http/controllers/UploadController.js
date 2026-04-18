const tikaService = require('../../../infrastructure/tika/TikaService');
const solrAdapter = require('../../../infrastructure/solr/SolrAdapter');
const db = require('../../../infrastructure/db/PostgresAdapter');

class UploadController {
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const fileBuffer = req.file.buffer;
            const fileName = req.file.originalname;
            const mimeType = req.file.mimetype;

            // 1. Save file to Database
            const insertQuery = 'INSERT INTO documents (filename, mimetype, data) VALUES ($1, $2, $3) RETURNING id';
            const dbResult = await db.query(insertQuery, [fileName, mimeType, fileBuffer]);
            const fileId = dbResult.rows[0].id;

            // 2. Extract text with Tika
            const textContent = await tikaService.extractText(fileBuffer, mimeType);

            if (!textContent || !textContent.trim()) {
                // Optional: Delete from DB if extraction fails? For now, keep it.
                return res.status(422).json({ error: 'Could not extract text from file' });
            }

            // 3. Index in Solr
            // Use the API URL to serve the file from DB
            const publicUrl = `http://localhost:5001/api/files/${fileId}`;

            const doc = {
                id: `file_${fileId}_${Date.now()}`,
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
