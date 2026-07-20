export default async function handler(req, res) {
    const { prompt } = req.query

    if (!prompt) {
        return res.status(400).json({
            status: false,
            creator: "Vanz API",
            model: "Vanz AI",
            message: "Parameter 'prompt' wajib diisi."
        })
    }

    try {
        const response = await fetch(
            `https://api.azbry.com/api/ai/claude?q=${encodeURIComponent(prompt)}`
        )

        const data = await response.json()

        res.status(200).json({
            status: true,
            creator: "Vanz API",
            model: "Vanz AI",
            prompt,
            result: data.result || data.response || data.data || data
        })

    } catch (err) {
        res.status(500).json({
            status: false,
            creator: "Vanz API",
            model: "Vanz AI",
            message: err.message
        })
    }
}
