const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Counter Request Sederhana
let globalTotalRequests = 0;

app.use((req, res, next) => {
    if (req.path !== '/favicon.ico') {
        globalTotalRequests++;
    }
    next();
});

// 1. STATS ENDPOINT
app.get('/api/stats', (req, res) => {
    res.json({
        status: true,
        creator: "Vanz API",
        totalRequests: globalTotalRequests
    });
});

// 2. AI ENDPOINT
app.get('/api/ai/vanz-ai', (req, res) => {
    const prompt = req.query.prompt || 'Halo!';
    res.json({
        status: true,
        creator: "Vanz API",
        result: `Halo! Ini adalah respon dari VANZ AI untuk prompt: "${prompt}"`
    });
});

// 3. CANVAS ENDPOINT (Fake Notif)
app.get('/api/canvas/fakenotif', (req, res) => {
    const { ppurl, username, chat, tanggal, jam } = req.query;
    
    // Nanti logika pembuatan gambar (canvas/sharp/jimp) diproses di sini
    res.json({
        status: true,
        creator: "Vanz API",
        message: "Endpoint Fake Notif siap digabungkan dengan fungsi Canvas.",
        params: { ppurl, username, chat, tanggal, jam }
    });
});

// 4. MAKER ENDPOINT (Brat)
app.get('/api/maker/brat', (req, res) => {
    const text = req.query.text || 'VanzDev';
    
    // Nanti logika pembuat gambar Brat diproses di sini
    res.json({
        status: true,
        creator: "Vanz API",
        message: "Endpoint Brat Maker siap digabungkan dengan fungsi Canvas.",
        text: text
    });
});

// 5. DOWNLOADER ENDPOINT (All in One)
app.get('/api/downloader/allinone', (req, res) => {
    const { url, format } = req.query;
    
    if (!url) {
        return res.status(400).json({ status: false, error: "Parameter URL wajib diisi!" });
    }

    res.json({
        status: true,
        creator: "Vanz API",
        message: "Downloader All-in-One siap diintegrasikan dengan library scraper kamu.",
        url: url,
        format: format || "mp3"
    });
});

// 6. TOOLS ENDPOINT (Remove BG)
app.get('/api/tools/removebg', (req, res) => {
    const image = req.query.image;

    if (!image) {
        return res.status(400).json({ status: false, error: "Parameter image URL wajib diisi!" });
    }

    res.json({
        status: true,
        creator: "Vanz API",
        message: "Endpoint Remove BG siap diproses.",
        imageUrl: image
    });
});

// Export untuk Serverless Vercel
module.exports = app;
