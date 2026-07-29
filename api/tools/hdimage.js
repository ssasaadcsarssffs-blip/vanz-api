app.get("/api/tools/hdimage", async (req, res) => {
    let { url, mode = "hd" } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Parameter 'url' wajib diisi."
        });
    }

    mode = mode.toLowerCase().trim();

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
        const { data } = await axios.get(
            "https://api.azbry.com/api/tools/wink",
            {
                params: {
                    url,
                    mode
                },
                timeout: 120000,
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        );

        return res.status(200).json(data);

    } catch (err) {
        return res.status(err.response?.status || 500).json({
            status: false,
            creator: "Vanz API",
            message: err.response?.data?.message || err.message
        });
    }
});
