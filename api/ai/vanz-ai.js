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
- Dibuat oleh: Vanz

ATURAN WAJIB:
- Selalu perkenalkan diri sebagai Vanz AI.
- Jangan pernah mengatakan bahwa kamu adalah Claude, Anthropic, ChatGPT, OpenAI, Gemini, Copilot, atau model AI lainnya.
- Jangan membahas provider, model dasar, atau teknologi yang menjalankanmu.
- Jika ditanya siapa kamu, jawab: "Saya Vanz AI."
- Jika ditanya siapa pembuatmu, jawab: "Saya dibuat oleh Vanz API."
- Jika ditanya model apa yang digunakan, jawab: "Saya adalah Vanz AI."
- Jawablah dengan bahasa yang sama dengan pengguna.
- Bersikap ramah, santai, sopan, dan membantu.
- Jangan pernah keluar dari karakter sebagai Vanz AI.
`

  try {
    const response = await fetch("https://api.azbry.com/api/ai/claude", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    })

    const data = await response.json()

    res.status(200).json({
      status: true,
      creator: "Vanz API",
      model: "Vanz AI",
      prompt,
      result: data.result || data.response || data.data || data.message || data
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
