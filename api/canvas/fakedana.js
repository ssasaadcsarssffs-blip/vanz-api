import axios from "axios"
import fs from "fs"
import path from "path"
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas"

const TMP_DIR = "/tmp"

const BG_URL = "https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/fkedana.png"
const ICON_URL = "https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/IMG-20260726-WA1031.jpg"
const FONT_URL = "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-600-normal.ttf"

const FONT_PATH = path.join(TMP_DIR, "custom-font.ttf")

let fontLoaded = false

async function getBuffer(url) {
    const res = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    })

    return Buffer.from(res.data)
}

async function loadFont() {
    if (fontLoaded) return

    if (!fs.existsSync(FONT_PATH)) {
        const fontBuffer = await getBuffer(FONT_URL)
        fs.writeFileSync(FONT_PATH, fontBuffer)
    }

    try {
        GlobalFonts.registerFromPath(FONT_PATH, "CustomFont")
    } catch {}

    fontLoaded = true
}

export default async function handler(req, res) {
    try {
        const { saldo } = req.query

        if (!saldo) {
            return res.status(400).json({
                status: false,
                code: 400,
                creator: "VanzWeb",
                message: "Missing required parameter.",
                idea: "by Rin"
            })
        }

        await loadFont()

        const [bgBuffer, iconBuffer] = await Promise.all([
            getBuffer(BG_URL),
            getBuffer(ICON_URL)
        ])

        const bg = await loadImage(bgBuffer)
        const icon = await loadImage(iconBuffer)

        const canvas = createCanvas(bg.width, bg.height)
        const ctx = canvas.getContext("2d")

        ctx.drawImage(
            bg,
            0,
            0,
            canvas.width,
            canvas.height
        )

        const text = saldo.toString()

        let fontSize = 40

        ctx.font = `${fontSize}px CustomFont`

        while (
            ctx.measureText(text).width > 350 &&
            fontSize > 15
        ) {
            fontSize -= 2
            ctx.font = `${fontSize}px CustomFont`
        }

        ctx.fillStyle = "#FFFFFF"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"

        const textX = 150
        const textY = 80

        ctx.fillText(text, textX, textY)

        const textWidth = ctx.measureText(text).width

        ctx.drawImage(
            icon,
            textX + textWidth + 10,
            textY - 15,
            30,
            30
        )

        const buffer = await canvas.encode("png")

        res.setHeader(
            "Content-Type",
            "image/png"
        )

        res.setHeader(
            "Cache-Control",
            "public, max-age=86400"
        )

        return res.status(200).send(buffer)

    } catch (err) {
        console.error(err)

        return res.status(500).json({
            status: false,
            code: 500,
            creator: "VanzWeb",
            message: err.message,
            idea: "by Rin"
        })
    }
}
