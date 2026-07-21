export default async function handler(req, res) {
  const {
    text,
    chattime,
    statusbartime,
    bubblecolor,
    menucolor,
    textcolor,
    fontname,
    signalname
  } = req.query

  if (!text || !chattime || !statusbartime || !fontname || !signalname) {
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Parameter wajib: text, chattime, statusbartime, fontname, signalname"
    })
  }

  const params = new URLSearchParams({
    text,
    chattime,
    statusbartime,
    fontname,
    signalname,
    apikey: "freeApikey"
  })

  if (bubblecolor) params.append("bubblecolor", bubblecolor)
  if (menucolor) params.append("menucolor", menucolor)
  if (textcolor) params.append("textcolor", textcolor)

  try {
    const response = await fetch(
      `https://anabot.my.id/api/maker/iqc?${params.toString()}`
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
  } catch (e) {
    res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: e.message
    })
  }
}
