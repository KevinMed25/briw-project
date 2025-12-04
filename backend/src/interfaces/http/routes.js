const express = require('express');
const router = express.Router();
const searchController = require('./controllers/SearchController');

const multer = require('multer');
const upload = multer();
const uploadController = require('./controllers/UploadController');

router.get('/search', (req, res) => searchController.search(req, res));
router.get('/suggest', (req, res) => searchController.suggest(req, res));
router.post('/upload', upload.single('file'), (req, res) => uploadController.upload(req, res));

module.exports = router;
