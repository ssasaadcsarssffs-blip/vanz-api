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
      `https://anabot.my.id/api/maker/iqc?text=${encodeURIComponent(text)}&apikey=freeApikey`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const contentType = response.headers.get("content-type") || ""

    // Jika hasilnya JSON
    if (contentType.includes("application/json")) {
      const data = await response.json()

      return res.status(200).json({
        creator: "Vanz API",
        ...data
      })
    }

    // Jika hasilnya gambar/file
    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader("Content-Type", contentType)
    res.send(buffer)

  } catch (err) {
    res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: err.message
    })
  }
}
