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

// 3. DOWNLOADER ENDPOINT (All in One - Sesuai Logika Kode Kamu)
app.get('/api/downloader/allinone', async (req, res) => {
    const { url, format = "mp4" } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Parameter 'url' wajib diisi."
        });
    }

    if (!["mp3", "mp4"].includes(format.toLowerCase())) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Format hanya boleh 'mp3' atau 'mp4'."
        });
    }

    try {
        const response = await fetch(
            `https://api.azbry.com/api/download/allinonev2?url=${encodeURIComponent(url)}&format=${format.toLowerCase()}`
        );

        const data = await response.json();

        if (!response.ok || !data.status) {
            return res.status(response.status || 500).json({
                status: false,
                creator: "Vanz API",
                message: data.message || "Gagal mengambil data dari provider."
            });
        }

        return res.status(200).json({
            status: true,
            creator: "Vanz API",
            result: data.result
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            creator: "Vanz API",
            message: err.message
        });
    }
});

// 4. MAKER ENDPOINT (Brat)
app.get('/api/maker/brat', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Parameter 'text' wajib diisi."
        });
    }

    try {
        // Mengambil gambar/data dari provider brat
        const response = await fetch(`https://api.azbry.com/api/maker/brat?text=${encodeURIComponent(text)}`);
        
        // Jika provider mengembalikan JSON
        if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        // Jika provider langsung mengembalikan Buffer/Gambar
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
        return res.send(buffer);

    } catch (err) {
        return res.status(500).json({
            status: false,
            creator: "Vanz API",
            message: err.message
        });
    }
});

// 5. CANVAS ENDPOINT (Fake Notif)
app.get('/api/canvas/fakenotif', async (req, res) => {
    const { ppurl, username, chat, tanggal, jam } = req.query;

    if (!ppurl || !username || !chat) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Parameter 'ppurl', 'username', dan 'chat' wajib diisi."
        });
    }

    try {
        const targetUrl = `https://api.azbry.com/api/canvas/fakenotif?ppurl=${encodeURIComponent(ppurl)}&username=${encodeURIComponent(username)}&chat=${encodeURIComponent(chat)}&tanggal=${encodeURIComponent(tanggal || '')}&jam=${encodeURIComponent(jam || '')}`;
        const response = await fetch(targetUrl);

        if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
        return res.send(buffer);

    } catch (err) {
        return res.status(500).json({
            status: false,
            creator: "Vanz API",
            message: err.message
        });
    }
});

// 6. TOOLS ENDPOINT (Remove BG)
app.get('/api/tools/removebg', async (req, res) => {
    const image = req.query.image;

    if (!image) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Parameter 'image' URL wajib diisi."
        });
    }

    try {
        const response = await fetch(`https://api.azbry.com/api/tools/removebg?url=${encodeURIComponent(image)}`);
        
        if (response.headers.get('content-type')?.includes('application/json')) {
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
        return res.send(buffer);

    } catch (err) {
        return res.status(500).json({
            status: false,
            creator: "Vanz API",
            message: err.message
        });
    }
});

module.exports = app;
