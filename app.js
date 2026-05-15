const express = require('express');
const path    = require('path');
const app     = express();
const PORT    = process.env.PORT || 4000;

// Serve static files from the public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// Root route — serve the game HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health-check endpoint used by Docker HEALTHCHECK & K8s probes
app.get('/api/health', (req, res) => {
    res.json({
        status:    'healthy',
        timestamp: new Date().toISOString(),
        service:   'Snake Game API',
        version:   '1.0.0',
        uptime:    process.uptime()
    });
});

// Start the server — bind to 0.0.0.0 so it is reachable inside a container
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎮  Snake Game Server running on port ${PORT}`);
    console.log(`🌐  Health: http://localhost:${PORT}/api/health`);
});
