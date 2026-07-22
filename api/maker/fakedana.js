const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

export default async function handler(req, res) {
  const saldo = String(req.query.saldo ?? "");

  if (!saldo) {
    return res.status(400).send("Parameter 'saldo' wajib diisi");
  }

  try {
    // --- LOG CEK SERVER ---
    console.log("DEBUG - Saldo:", saldo);

    const imageUrl = "https://cloud.yardansh.com/pZ6anz.jpg";
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);

    // --- KOTAK MERAH DIAGNOSTIK ---
    // Uncomment baris ini untuk tes. Kalau muncul, canvas bisa nulis.
    // ctx.fillStyle = "#FF0000";
    // ctx.fillRect(90, 20, 20, 20); 

    // --- LOG SEBELUM NULIS TEKS ---
    console.log("DEBUG - ctx.fillText =", typeof ctx.fillText);
    console.log("DEBUG - font =", ctx.font);

    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 65px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    console.log("DEBUG - Menulis teks: Rp", saldo);
    ctx.fillText(`Rp ${saldo}`, 95, 65);
    console.log("DEBUG - fillText selesai");

    ctx.restore();

    const output = await canvas.encode('png');

    res.setHeader('Content-Type', 'image/png');
    return res.status(200).send(output);

  } catch (err) {
    console.error("ERROR:", err.message);
    return res.status(500).send("Error: " + err.message);
  }
}
