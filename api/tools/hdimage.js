import axios from "axios";
import WinkEnhancer from "../../lib/WinkEnhancer.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: false,
      code: 405,
      creator: "VanzWeb",
      message: "Method Not Allowed"
    });
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      status: false,
      code: 400,
      creator: "VanzWeb",
      message: "Parameter 'url' diperlukan."
    });
  }

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const imageBuffer = Buffer.from(response.data);
    const mimeType = response.headers["content-type"];

    const enhancer = new WinkEnhancer();

    const result = await enhancer.generate({
      imageBuffer,
      mimeType
    });

    return res.status(200).json({
      status: true,
      code: 200,
      creator: "VanzWeb",
      result: {
        image: result.Result_url
      }
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: false,
      code: 500,
      creator: "VanzWeb",
      message: err.message || "Internal Server Error"
    });
  }
}
