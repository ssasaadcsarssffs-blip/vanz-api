// Variable penampung request (Serverless Vercel)
let globalTotalRequests = 0;

module.exports = async (req, res) => {
    // Tambah hit setiap kali endpoint ini atau endpoint lain dipanggil
    globalTotalRequests++;

    // Izinkan CORS agar bisa diakses oleh frontend mana saja
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Kirim respons JSON ke dashboard
    res.status(200).json({
        status: true,
        creator: "Vanz API",
        totalRequests: globalTotalRequests
    });
};
