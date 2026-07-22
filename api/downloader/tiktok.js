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
    const { data } = await axios.get(
      "https://api.azbry.com/api/download/tiktok",
      {
        params: { url },
        timeout: 30000
      }
    );

    return res.status(200).json({
      status: true,
      creator: "Vanz API",
      model: "TikTok Downloader",
      result: data
    });
  } catch (err) {
    return res.status(err.response?.status || 500).json({
      status: false,
      creator: "Vanz API",
      model: "TikTok Downloader",
      message: err.response?.data?.message || err.message
    });
  }
}
