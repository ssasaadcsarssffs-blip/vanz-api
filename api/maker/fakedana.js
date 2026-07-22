const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

export default async function handler(req, res) {
  const { saldo } = req.query;

  if (!saldo) {
    return res.status(400).send("Parameter 'saldo' wajib diisi");
  }

  try {
    // 1. Scrape gambar dari link
    const imageUrl = "https://cloud.yardansh.com/pZ6anz.jpg";
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    // 2. Load gambar ke Canvas
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    // 3. Gambar background
    ctx.drawImage(image, 0, 0);

    // 4. Tulis angka saldo baru
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 65px sans-serif'; 
    ctx.fillText(`Rp ${saldo}`, 125, 30);

    // 5. Ubah Canvas ke Buffer JPG (BUKAN JSON)
    const output = canvas.toBuffer('image/jpeg');

    // 6. Set header dan kirim langsung file gambar
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=0');
    
    return res.status(200).send(output);

  } catch (err) {
    return res.status(500).send("Error: " + err.message);
  }
}
