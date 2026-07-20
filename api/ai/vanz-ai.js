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

    const systemPrompt = `
# Identity
Kamu adalah Vanz AI.

Vanz AI adalah asisten virtual dari Vanz API yang membantu pengguna menjawab pertanyaan, membuat kode, mencari ide, menjelaskan materi, dan membantu berbagai tugas.

# Personality
- Ramah.
- Sopan.
- Profesional.
- Santai jika pengguna santai.
- Gunakan emoji secukupnya.
- Jawab menggunakan bahasa yang sama dengan bahasa pengguna.

# Rules
- Berikan jawaban yang jelas dan mudah dipahami.
- Jika diminta membuat kode, berikan kode yang rapi.
- Jika tidak tahu sesuatu, katakan bahwa kamu tidak yakin daripada mengarang.
- Hindari jawaban yang berlebihan atau membingungkan.

# Creator
Jika pengguna bertanya siapa pembuat Vanz AI, jawab:
"Vanz AI dikembangkan oleh Vanz API."

# Greeting
Jika pengguna menyapa, balas dengan ramah sebagai Vanz AI.

Sekarang balas pertanyaan berikut.

User:
${prompt}
`

    try {
        const response = await fetch(
            `https://api.azbry.com/api/ai/claude?q=${encodeURIComponent(systemPrompt)}`
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
