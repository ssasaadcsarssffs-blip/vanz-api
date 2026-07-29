app.get("/api/tools/hdimage", async (req, res) => {
    let { url, mode = "hd" } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Parameter 'url' wajib diisi."
        });
    }

    mode = String(mode).trim().toLowerCase();

    if (mode === "ultrahd" || mode === "ultra_hd")
        mode = "ultra hd";

    if (!["hd", "ultra hd"].includes(mode)) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Mode hanya boleh 'hd' atau 'ultra hd'."
        });
    }

    try {
        const response = await axios({
            method: "GET",
            url: "https://api.azbry.com/api/tools/wink",
            params: {
                url,
                mode
            },
            timeout: 120000,
            validateStatus: () => true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Referer": "https://api.azbry.com/",
                "Origin": "https://api.azbry.com"
            }
        });

        if (response.status >= 400) {
            return res.status(response.status).json({
                status: false,
                error: "Failed to fetch data",
                message: `HTTP ${response.status}`,
                provider: response.data
            });
        }

        return res.status(200).json(response.data);

    } catch (err) {
        console.error("========== WINK ERROR ==========");
        console.error(err.response?.status);
        console.error(err.response?.data);
        console.error(err.message);
        console.error("================================");

        return res.status(500).json({
            status: false,
            error: "Failed to fetch data",
            message: err.message,
            providerStatus: err.response?.status || null,
            providerResponse: err.response?.data || null
        });
    }
});
