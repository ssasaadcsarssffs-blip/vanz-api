const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Variabel penampung request global
let globalTotalRequests = 0;

// Middleware: Hitung tiap ada request masuk
app.use((req, res, next) => {
    // Abaikan favicon agar tidak merusak hitungan
    if (req.path !== '/favicon.ico') {
        globalTotalRequests++;
    }
    next();
});

// Endpoint untuk kirim data ke Dashboard Landing Page
app.get('/api/stats', (req, res) => {
    res.json({
        status: true,
        totalRequests: globalTotalRequests
    });
});

// Contoh mengarahkan endpoint lain jika diperlukan
// app.use('/api/ai', require('./api/ai')); 

// Export untuk Vercel Serverless
module.exports = app;
