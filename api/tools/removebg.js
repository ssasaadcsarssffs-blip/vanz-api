/*
 * Created by : febry.is-a.dev
 * API Wrapper : Vanz API
 * Jangan hapus watermark creator asli.
 */

import axios from "axios";
import FormData from "form-data";

async function removebg(options = {}) {
  const {
    image,
    mode = "removebg",
    scale = "2",
    highRes = false,
  } = options;

  if (!image) throw new Error('Parameter "image" is required');

  const client = axios.create({
    baseURL: "https://api.yunusek.org",
    headers: {
      "User-Agent": "okhttp/4.9.2",
      "Accept-Encoding": "gzip",
    },
  });

  async function resolveImage(input) {
    if (Buffer.isBuffer(input)) return input;

    if (typeof input === "string") {
      if (input.startsWith("http")) {
        const res = await axios.get(input, {
          responseType: "arraybuffer",
        });
        return Buffer.from(res.data);
      }

      if (input.includes("base64,")) {
        return Buffer.from(input.split(",")[1], "base64");
      }

      return Buffer.from(input, "base64");
    }

    throw new Error("Invalid image format");
  }

  async function request(endpoint, fields = {}, imageBuffer) {
    const form = new FormData();

    form.append("image", imageBuffer, {
      filename: "image.png",
      contentType: "image/png",
    });

    for (const [key, value] of Object.entries(fields)) {
      form.append(key, String(value));
    }

    const res = await client.post(endpoint, form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
    });

    return {
      buffer: Buffer.from(res.data),
      contentType: res.headers["content-type"] || "image/png",
    };
  }

  const activeMode = mode.toLowerCase();
  const imageBuffer = await resolveImage(image);

  if (activeMode === "removebg") {
    return request(
      "/api/remove-background",
      {
        high_res: highRes ? "true" : "false",
      },
      imageBuffer
    );
  }

  if (activeMode === "upscale") {
    return request(
      "/api/upscale",
      {
        scale: String(scale),
      },
      imageBuffer
    );
  }

  throw new Error('Mode hanya bisa "removebg" atau "upscale"');
}

export default async function handler(req, res) {
  const {
    image,
    mode = "removebg",
    scale = "2",
    highRes = "false",
  } = req.query;

  if (!image) {
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Parameter 'image' wajib diisi.",
    });
  }

  try {
    const result = await removebg({
      image,
      mode,
      scale,
      highRes: highRes === "true",
    });

    res.setHeader("Content-Type", result.contentType);
    return res.send(result.buffer);
  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: err.message,
    });
  }
}
