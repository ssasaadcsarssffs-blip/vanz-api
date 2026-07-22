const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

export default async function handler(req, res) {
  const { saldo } = req.query;

  if (!saldo) {
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Parameter 'saldo' wajib diisi."
    });
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
    ctx.textBaseline = 'top';
    ctx.font = 'bold 65px sans-serif'; 
    ctx.fillText(`Rp ${saldo}`, 125, 30);

    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

    return res.status(200).json({
      status: true,
      creator: "Vanz API",
      model: "Fake Dana",
      saldo: saldo,
      result: base64Image,
      message: "Berhasil scrape & edit gambar."
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      creator: "Vanz API",
      model: "Fake Dana",
      message: err.message
    });
  }
}
