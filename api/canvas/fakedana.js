import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import axios from 'axios';

const CREATOR = 'Vanz API';

let fontLoaded = false;
let bgBuffer = null;
let eyeBuffer = null;

const TTF_URL = 'https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-600-normal.ttf';
const BG_URL = 'https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/fkedana.png';
const EYE_URL = 'https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/IMG-20260726-WA1031.jpg';

async function initAssets() {
  const headers = { 'User-Agent': 'Mozilla/5.0' };

  if (!fontLoaded) {
    const fontRes = await axios.get(TTF_URL, { responseType: 'arraybuffer', headers });
    GlobalFonts.register(Buffer.from(fontRes.data), 'DANA');
    fontLoaded = true;
  }

  if (!bgBuffer) {
    const bgRes = await axios.get(BG_URL, { responseType: 'arraybuffer', headers });
    bgBuffer = Buffer.from(bgRes.data);
  }

  if (!eyeBuffer) {
    const eyeRes = await axios.get(EYE_URL, { responseType: 'arraybuffer', headers });
    eyeBuffer = Buffer.from(eyeRes.data);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      creator: CREATOR,
      error: 405,
      message: 'Method not allowed. Use GET.'
    });
  }

  const saldo = req.query.saldo || req.query.text;

  if (!saldo) {
    return res.status(400).json({
      creator: CREATOR,
      error: 400,
      message: "parameter 'saldo' diperlukan"
    });
  }

  try {
    await initAssets();

    const bgImg = await loadImage(bgBuffer);
    const eyeImg = await loadImage(eyeBuffer);

    const canvas = createCanvas(bgImg.width, bgImg.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    const valX = 138;
    const valY = 52;
    const maxFontSize = 37;
    const eyeGap = 7;
    const eyeScale = 1.3;

    const inputSaldo = saldo.trim();

    let currentFontSize = maxFontSize;
    const maxAllowedWidth = canvas.width - valX - 100;

    ctx.font = `600 ${currentFontSize}px DANA`;
    let textWidth = ctx.measureText(inputSaldo).width;

    while (textWidth > maxAllowedWidth && currentFontSize > 16) {
      currentFontSize -= 2;
      ctx.font = `600 ${currentFontSize}px DANA`;
      textWidth = ctx.measureText(inputSaldo).width;
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(inputSaldo, valX, valY);

    const eyeHeight = currentFontSize * eyeScale;
    const eyeWidth = (eyeImg.width / eyeImg.height) * eyeHeight;
    const eyeX = valX + textWidth + eyeGap;
    const eyeY = valY + (currentFontSize - eyeHeight) / 2;

    ctx.drawImage(eyeImg, eyeX, eyeY, eyeWidth, eyeHeight);

    const imageBuffer = await canvas.encode('png');

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(imageBuffer);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      creator: CREATOR,
      error: 500,
      message: error.message || 'Internal Server Error'
    });
  }
}
