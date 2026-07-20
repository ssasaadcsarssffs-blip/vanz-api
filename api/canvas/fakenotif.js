import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import fs from 'fs'
import path from 'path'
import axios from 'axios'

const APPLE_EMOJI_JSON_URL = 'https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json'
let appleEmojiMap = null
const emojiImageCache = new Map()
const EMOJI_REGEX = /(\p{Emoji_Modifier_Base}\p{Emoji_Modifier}|\p{Emoji_Presentation}\uFE0F?|\p{Emoji}\uFE0F|[\u{1F1E0}-\u{1F1FF}]{2}|\p{Extended_Pictographic}\uFE0F?)/gu

const TMP_DIR = '/tmp'
let isAssetLoaded = false;

async function getbufer(url) {
  const res = await axios.get(url, { 
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  })
  return Buffer.from(res.data)
}

function drawcircleimg(ctx, img, x, y, size) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x, y, size, size)
  ctx.restore()
}

async function loadAssets() {
  if (isAssetLoaded) return;
  
  const fonts = [
    { url: 'https://uploader.zenzxz.dpdns.org/uploads/1783935033044.ttf', name: 'RobotoBold', path: path.join(TMP_DIR, 'RobotoBold.ttf') },
    { url: 'https://uploader.zenzxz.dpdns.org/uploads/1783935096347.ttf', name: 'RobotoRegular', path: path.join(TMP_DIR, 'RobotoRegular.ttf') },
    { url: 'https://uploader.zenzxz.dpdns.org/uploads/1783935155987.ttf', name: 'SanFrancisco', path: path.join(TMP_DIR, 'SanFrancisco.ttf') }
  ]

  for (const font of fonts) {
    if (!fs.existsSync(font.path)) {
      const buf = await getbufer(font.url)
      fs.writeFileSync(font.path, buf)
    }
    try {
      GlobalFonts.registerFromPath(font.path, font.name)
    } catch (e) {
      console.log(`Font ${font.name} sudah terdaftar.`);
    }
  }
  isAssetLoaded = true;
}

function emojiToUnicode(emoji) {
  return [...emoji].map(c => c.codePointAt(0).toString(16).padStart(4, '0')).join('-')
}

async function loadAppleEmojiMap() {
  if (appleEmojiMap) return appleEmojiMap
  const localJson = path.join(TMP_DIR, 'emoji-apple.json')
  if (!fs.existsSync(localJson)) {
    const buf = await getbufer(APPLE_EMOJI_JSON_URL)
    fs.writeFileSync(localJson, buf)
  }
  const raw = fs.readFileSync(localJson, 'utf-8')
  appleEmojiMap = JSON.parse(raw)
  return appleEmojiMap
}

async function getEmojiImage(emoji) {
  if (emojiImageCache.has(emoji)) return emojiImageCache.get(emoji)
  try {
    const map = await loadAppleEmojiMap()
    const base = emojiToUnicode(emoji)
    const variants = [
      base,
      base.replace(/-fe0f/gi, ''),
      `${base.replace(/-fe0f/gi, '')}-fe0f`,
      base.toUpperCase(),
      base.replace(/-fe0f/gi, '').toUpperCase(),
      base.replace(/-fe0f/gi, '').toUpperCase() + '-FE0F',
    ]
    let b64 = null
    for (const v of variants) {
      if (map[v]) { b64 = map[v]; break; }
    }
    if (!b64) return null
    
    const buf = Buffer.from(b64, 'base64')
    const img = await loadImage(buf)
    emojiImageCache.set(emoji, img)
    return img
  } catch (e) {
    return null;
  }
}

async function drawAppleEmoji(ctx, emoji, x, y, size) {
  const img = await getEmojiImage(emoji)
  if (!img) {
    ctx.fillText(emoji, x, y)
    return
  }
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size)
}

async function drawTextWithEmojis(ctx, text, x, y, fontSize, fontString) {
  ctx.font = fontString
  const parts = text.split(EMOJI_REGEX)
  let currentX = x
  for (const part of parts) {
    if (!part) continue
    EMOJI_REGEX.lastIndex = 0
    if (EMOJI_REGEX.test(part)) {
      const emojiSize = fontSize * 1.05
      const emojiCX = currentX + emojiSize / 2
      const emojiCY = y + (fontSize / 2)
      await drawAppleEmoji(ctx, part, emojiCX, emojiCY, emojiSize)
      currentX += emojiSize
    } else {
      ctx.fillText(part, currentX, y)
      currentX += ctx.measureText(part).width
    }
    EMOJI_REGEX.lastIndex = 0
  }
}

export default async function handler(req, res) {
  const { ppurl, username, chat, tanggal, jam } = req.query

  if (!ppurl || !username || !chat) {
    res.setHeader('Content-Type', 'application/json')
    return res.status(400).json({
      status: false,
      creator: "Vanz API",
      message: "Parameter 'ppurl', 'username', dan 'chat' wajib diisi."
    })
  }

  try {
    await loadAssets()

    const baground = 'https://uploader.zenzxz.dpdns.org/uploads/1783938224798.png'
    const waIconUrl = 'https://uploader.zenzxz.dpdns.org/uploads/1783937277449.jpeg'

    let bgBuffer, ppBuffer, waIconBuffer
    
    try {
      [bgBuffer, ppBuffer, waIconBuffer] = await Promise.all([
        getbufer(baground),
        getbufer(ppurl),
        getbufer(waIconUrl)
      ])
    } catch (fetchError) {
      res.setHeader('Content-Type', 'application/json')
      return res.status(400).json({
        status: false,
        creator: "Vanz API",
        message: "Gagal mendownload salah satu gambar dari URL.",
        detail: fetchError.message
      })
    }

    let bg, ppImg, waImg

    try {
      bg = await loadImage(bgBuffer)
    } catch (e) {
      res.setHeader('Content-Type', 'application/json')
      return res.status(400).json({ status: false, creator: "Vanz API", message: "Error pada Background", detail: e.message })
    }

    try {
      ppImg = await loadImage(ppBuffer)
    } catch (e) {
      // Fallback otomatis pakai foto default kalau ppurl user error/SVG
      try {
        const defaultPpBuffer = await getbufer(waIconUrl)
        ppImg = await loadImage(defaultPpBuffer)
      } catch (errFallback) {
        res.setHeader('Content-Type', 'application/json')
        return res.status(400).json({ status: false, creator: "Vanz API", message: "Error pada Foto Profil (ppurl)", detail: e.message })
      }
    }

    try {
      waImg = await loadImage(waIconBuffer)
    } catch (e) {
      res.setHeader('Content-Type', 'application/json')
      return res.status(400).json({ status: false, creator: "Vanz API", message: "Error pada Icon WhatsApp", detail: e.message })
    }

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(bg, 0, 0, bg.width, bg.height)

    const tanggalBesar = tanggal || "Senin, 6 Maret"
    const tanggalY = 120
    ctx.font = '36px "SanFrancisco", sans-serif'
    ctx.fillStyle = '#C5C5C5'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(tanggalBesar, bg.width / 2, tanggalY)

    const jamBesar = jam || "6.39"
    const jamY = 170
    ctx.font = '160px "SanFrancisco", sans-serif'
    ctx.fillStyle = '#C5C5C5'
    ctx.textAlign = 'center'
    ctx.fillText(jamBesar, bg.width / 2, jamY)

    const ppSize = 77
    const ppX = 39
    const ppY = 909
    drawcircleimg(ctx, ppImg, ppX, ppY, ppSize)

    const waIconSize = 24
    const waIconX = ppX + ppSize - waIconSize + 2
    const waIconY = ppY + ppSize - waIconSize + 2
    drawcircleimg(ctx, waImg, waIconX, waIconY, waIconSize)

    const usernameX = 135
    const usernameY = 913
    const usernameFontSize = 26
    ctx.fillStyle = '#FFFFFF'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    await drawTextWithEmojis(ctx, username, usernameX, usernameY, usernameFontSize, 'bold 26px RobotoBold, sans-serif')

    const chatX = 135
    const chatY = 952
    const chatFontSize = 22
    ctx.fillStyle = '#FFFFFF'
    ctx.textBaseline = 'top'
    await drawTextWithEmojis(ctx, chat, chatX, chatY, chatFontSize, '22px RobotoRegular, sans-serif')

    const buffer = canvas.toBuffer('image/png')

    // Langsung kirim sebagai file gambar PNG (Auto Convert ke Image)
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    return res.status(200).send(buffer)

  } catch (err) {
    res.setHeader('Content-Type', 'application/json')
    return res.status(500).json({
      status: false,
      creator: "Vanz API",
      message: "Terjadi kesalahan internal pada Serverless API.",
      detail: err.message
    })
  }
}
