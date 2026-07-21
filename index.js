const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let globalTotalRequests = 0;

app.use('/api', (req, res, next) => {
    globalTotalRequests++;
    next();
});

app.get('/api/stats', (req, res) => {
    res.json({
        status: true,
        totalRequests: globalTotalRequests
    });
});

app.get('/api/ping', (req, res) => {
    res.json({ status: true, message: 'Pong!' });
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
}
