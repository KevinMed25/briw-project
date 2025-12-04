const db = require('../../../infrastructure/db/PostgresAdapter');

class FileController {
    async getFile(req, res) {
        try {
            const fileId = req.params.id;

            if (!fileId) {
                return res.status(400).json({ error: 'File ID is required' });
            }

            const query = 'SELECT filename, mimetype, data FROM documents WHERE id = $1';
            const result = await db.query(query, [fileId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'File not found' });
            }

            const file = result.rows[0];

            res.setHeader('Content-Type', file.mimetype);
            res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);

            // Send the binary data
            res.send(file.data);

        } catch (error) {
            console.error('Get File Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = new FileController();
