export default async function handler(req, res) {
  try {
    const url = req.query.url || req.query.link

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: "Vanz API",
        message: "Parameter 'url' diperlukan."
      })
    }

    const payload = new URLSearchParams({
      auth: "20250901majwlqo",
      domain: "api-ak.vidssave.com",
      origin: "source",
      link: url
    })

    const response = await fetch(
      "https://api.vidssave.com/api/contentsite_api/media/parse",
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "accept-language": "id-ID",
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded",
          origin: "https://vidssave.com",
          pragma: "no-cache",
          referer: "https://vidssave.com/",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36"
        },
        body: payload.toString()
      }
    )

    const json = await response.json()

    return res.status(200).json({
      status: true,
      creator: "Vanz API",
      result: json.data || json
    })
  } catch (e) {
    return res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: e.message
    })
  }
}
