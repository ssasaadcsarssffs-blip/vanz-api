export default async function handler(req, res) {
  const prompt = req.query.q || req.query.message

  if (!prompt) {
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Parameter 'q' wajib diisi."
    })
  }

  try {
    const response = await fetch(
      `https://api.azbry.com/api/ai/claude?q=${encodeURIComponent(prompt)}`
    )

    const data = await response.json()

    return res.status(response.status).json({
      creator: "Vanz API",
      ...data
    })

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: err.message
    })
  }
}
