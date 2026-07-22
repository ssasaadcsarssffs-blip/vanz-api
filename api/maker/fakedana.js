const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('@napi-rs/canvas');
const path = require('path');

// Daftarkan font biar Vercel kenal
registerFont('./Roboto-Bold.ttf', { family: 'Roboto' });

export default async function handler(req, res) {
  const saldo = String(req.query.saldo ?? "0");

  if (!saldo || saldo === "0") {
    return res.status(400).send("Parameter 'saldo' wajib diisi");
  }

  try {
    const imageUrl = "https://cloud.yardansh.com/pZ6anz.jpg";
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);

    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    
    // PAKAI FONT YANG SUDAH DIDAFTARKAN
    ctx.font = 'bold 65px Roboto'; 
    ctx.fillText(`Rp ${saldo}`, 135, 45);

    const output = canvas.toBuffer('image/jpeg');

    res.setHeader('Content-Type', 'image/jpeg');
    return res.status(200).send(output);

  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).send("Error: " + err.message);
  }
}
