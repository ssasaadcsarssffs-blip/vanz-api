export default async function handler(req, res) {
  const { text } = req.query

  if (!text) {
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Parameter 'text' wajib diisi."
    })
  }

  try {
    const response = await fetch(
      `https://api.azbry.com/api/ai/claude?text=${encodeURIComponent(text)}`
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
