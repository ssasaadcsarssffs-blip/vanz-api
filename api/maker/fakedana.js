const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

export default async function handler(req, res) {
  const { saldo } = req.query;

  if (!saldo) {
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
    ctx.font = 'bold 65px sans-serif'; 
    ctx.fillText(`Rp ${saldo}`, 125, 30);

    // Ubah canvas jadi Buffer gambar jpeg
    const finalBuffer = canvas.toBuffer('image/jpeg');

    // SET HEADER BIAR BROWSER ANGGEAP INI GAMBAR ASLI
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'inline; filename="fakedana.jpg"');
    
    // Kirim buffer gambar langsung
    return res.send(finalBuffer);

  } catch (err) {
    return res.status(500).send("Error: " + err.message);
  }
}
