export default async function handler(req, res) {
  const { url, format = "mp4" } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Parameter 'url' wajib diisi."
    });
  }

  if (!["mp3", "mp4"].includes(format.toLowerCase())) {
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Format hanya boleh 'mp3' atau 'mp4'."
    });
  }

  try {
    const response = await fetch(
      `https://api.azbry.com/api/download/allinonev2?url=${encodeURIComponent(url)}&format=${format.toLowerCase()}`
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return res.status(response.status || 500).json({
        status: false,
        creator: "Vanz API",
        message: data.message || "Gagal mengambil data."
      });
    }

    return res.status(200).json({
      status: true,
      creator: "Vanz API",
      result: data.result
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: err.message
    });
  }
}
