const FormData = require("form-data");

app.get("/api/tools/hdimage", async (req, res) => {
    const { url, mode = "hd" } = req.query;

    if (!url) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            message: "Parameter 'url' wajib diisi."
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
                timeout: 120000
            }
        );

        if (!data.status) {
            return res.json(data);
        }

        const wink = await axios.get(data.result.result_url, {
            responseType: "arraybuffer"
        });

        const form = new FormData();
        form.append("file", Buffer.from(wink.data), {
            filename: "wink.jpg",
            contentType: "image/jpeg"
        });

        const upload = await axios.post(
            "https://cloud.yardansh.com/upload",
            form,
            {
                headers: form.getHeaders(),
                maxBodyLength: Infinity
            }
        );

        return res.json({
            status: true,
            creator: "Vanz API",
            result: {
                mode,
                input_url: url,
                url: upload.data.url
            }
        });

    } catch (e) {
        return res.status(500).json({
            status: false,
            error: "Failed to fetch data",
            message: e.response?.data || e.message
        });
    }
});
