import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: false,
      code: 405,
      creator: "VanzWeb",
      message: "Method Not Allowed"
    });
  }

  const { url, mode = "hd" } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      code: 400,
      creator: "VanzWeb",
      message: "Parameter 'url' diperlukan."
    });
  }

  if (!["hd", "ultrahd"].includes(mode.toLowerCase())) {
    return res.status(400).json({
      status: false,
      code: 400,
      creator: "VanzWeb",
      message: "Parameter 'mode' hanya boleh 'hd' atau 'ultrahd'."
    });
  }

  try {
    const { data } = await axios.get(
      "https://api.azbry.com/api/tools/wink",
      {
        params: {
          url,
          mode: mode.toLowerCase()
        },
        timeout: 120000
      }
    );

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      status: false,
      code: 500,
      creator: "VanzWeb",
      message: err.response?.data?.message || err.message
    });
  }
}
