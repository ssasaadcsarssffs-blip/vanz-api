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
      `https://api.azbry.com/api/maker/brat?text=${encodeURIComponent(text)}`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader("Content-Type", response.headers.get("content-type") || "image/png")
    res.send(buffer)

  } catch (err) {
    res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: err.message
    })
  }
}
