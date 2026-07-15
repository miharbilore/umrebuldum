const express = require('express');
const cors = require('cors');
const path = require('path');
const mapsData = require('./data/maps');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch map configuration by mapId
app.get('/api/maps/:mapId', (req, res) => {
    const mapId = req.params.mapId;
    const map = mapsData.find(m => m.mapId === mapId);
    
    if (map) {
        res.json(map);
    } else {
        res.status(404).json({ error: 'Map not found' });
    }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Interactive Map System running on http://localhost:${PORT}`);
});
