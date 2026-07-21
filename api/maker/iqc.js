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
    const now = new Date()
    const timeNow = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta"
    })

    const response = await fetch(
      'https://anabot.my.id/api/maker/iqc?' +
      `text=${encodeURIComponent(text)}` +
      `&chatTime=${encodeURIComponent(timeNow)}` +
      `&statusBarTime=${encodeURIComponent(timeNow)}` +
      '&bubbleColor=%23272a2f' +
      '&menuColor=%23272a2f' +
      '&textColor=%23FFFFFF' +
      '&fontName=Arial' +
      '&signalName=Telkomsel' +
      '&apikey=freeApikey'
    )

    if (!response.ok) {
      throw new Error(await response.text())
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "image/png"
    )

    res.send(buffer)

  } catch (err) {
    res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: err.message
    })
  }
}
