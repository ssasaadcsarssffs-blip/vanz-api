const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

export default async function handler(req, res) {
  // 1. AMBIL PARAM DENGAN AMAN (Seperti saran lo poin 4)
  const saldo = String(req.query.saldo ?? "0"); 

  // 2. VALIDASI DI LOG SERVER (Buat cek di Vercel Logs)
  console.log("DEBUG - Saldo yang diterima:", saldo);

  if (!saldo || saldo === "0") {
    return res.status(400).send("Parameter 'saldo' wajib diisi atau tidak boleh 0");
  }

  try {
    const imageUrl = "https://cloud.yardansh.com/pZ6anz.jpg";
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    
    const image = await loadImage(buffer);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);

    // 3. ATUR FONT & WARNA
    ctx.fillStyle = '#FFFFFF'; // Putih
    ctx.textBaseline = 'middle';
    
    // Ganti font ke 'sans-serif' biar aman tanpa load file font eksternal
    ctx.font = 'bold 65px sans-serif'; 

    // 4. TULIS ANGKA DENGAN PASTI SALDONYA STRING
    const saldoText = `Rp ${saldo}`;
    console.log("DEBUG - Menulis teks:", saldoText); // Cek lagi di log

    // Posisi X=135, Y=45 (sedikit geser kanan & bawah biar pas di kotak saldo)
    ctx.fillText(saldoText, 135, 45);

    const output = canvas.toBuffer('image/jpeg');

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=0');
    
    return res.status(200).send(output);

  } catch (err) {
    console.error("ERROR:", err.message); // Catat error di Vercel Logs
    return res.status(500).send("Error: " + err.message);
  }
}
