export default async function handler(req, res) {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Parameter 'url' wajib diisi."
    });
  }

  try {
    const response = await fetch(
      `https://api.azbry.com/api/download/tiktok?url=${encodeURIComponent(url)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      status: true,
      creator: "Vanz API",
      model: "TikTok Downloader",
      result: data
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "Vanz API",
      model: "TikTok Downloader",
      message: err.message
    });
  }
}
