const express = require('express');
const router = express.Router();
const searchController = require('./controllers/SearchController');

const multer = require('multer');
const upload = multer();
const uploadController = require('./controllers/UploadController');
const fileController = require('./controllers/FileController');
const crawlerController = require('./controllers/CrawlerController');

router.get('/search', (req, res) => searchController.search(req, res));
router.post('/search/clear', (req, res) => searchController.clearIndex(req, res));
router.get('/suggest', (req, res) => searchController.suggest(req, res));
router.post('/upload', upload.single('file'), (req, res) => uploadController.upload(req, res));
router.get('/files/:id', (req, res) => fileController.getFile(req, res));

// Crawler routes
router.get('/crawler/seeds', (req, res) => crawlerController.getSeeds(req, res));
router.post('/crawler/seeds', express.json(), (req, res) => crawlerController.updateSeeds(req, res));
router.post('/crawler/run', (req, res) => crawlerController.runCrawler(req, res));
router.get('/crawler/status', (req, res) => crawlerController.getCrawlerStatus(req, res));

module.exports = router;
