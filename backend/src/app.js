const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./interfaces/http/routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(config.port, () => {
    console.log(`Backend running on port ${config.port}`);
});
