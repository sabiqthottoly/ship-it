const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { deploy } = require('./deployService');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/deploy', async (req, res) => {
    const config = req.body;

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendLog = (message, type = 'info') => {
        const data = JSON.stringify({ message, type, timestamp: new Date().toISOString() });
        res.write(`data: ${data}\n\n`);
    };

    try {
        sendLog('Starting deployment process...', 'info');
        await deploy(config, sendLog);
        sendLog('Deployment completed successfully!', 'success');
    } catch (error) {
        sendLog(`Deployment failed: ${error.message}`, 'error');
    } finally {
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
