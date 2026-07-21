const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

let globalTotalRequests = 0;

app.use((req, res, next) => {
    if (req.path !== '/favicon.ico') {
        globalTotalRequests++;
    }
    next();
});

app.use(express.static(path.join(__dirname, './')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/stats', (req, res) => {
    res.json({
        status: true,
        creator: "Vanz API",
        totalRequests: globalTotalRequests
    });
});

app.get('/api/ai/vanz-ai', (req, res) => {
    const prompt = req.query.prompt || 'Halo!';
    res.json({
        status: true,
        creator: "Vanz API",
        result: `Halo! Ini adalah respon dari VANZ AI untuk prompt: "${prompt}"`
    });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server lokal berjalan di http://localhost:${PORT}`);
    });
}
