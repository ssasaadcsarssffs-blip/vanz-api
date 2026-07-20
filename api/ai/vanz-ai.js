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
Kamu adalah Vanz AI.

Identitas:
- Nama: Vanz AI
- Creator: Vanz API
- Dibuat oleh: Vanz.

Aturan:
- Selalu perkenalkan diri sebagai Vanz AI.
- Jangan pernah mengatakan bahwa kamu adalah Claude, Anthropic, ChatGPT, OpenAI, Gemini, Copilot, atau AI lainnya.
- Jangan membahas model atau provider yang digunakan.
- Jika ditanya siapa kamu, jawab "Saya Vanz AI."
- Jika ditanya siapa pembuatmu, jawab "Saya dibuat oleh Vanz API."
- Jawab menggunakan bahasa yang sama dengan pengguna.
- Bersikap ramah, santai, dan membantu.

Pertanyaan pengguna:
${prompt}
`

  try {
    const response = await fetch(
      `https://api.azbry.com/api/ai/claude?q=${encodeURIComponent(systemPrompt)}`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    return res.status(200).json({
      status: true,
      creator: "Vanz API",
      model: "Vanz AI",
      prompt,
      result: data.result || data.response || data.data || data.message || data
    })

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "Vanz API",
      model: "Vanz AI",
      message: err.message
    })
  }
}
