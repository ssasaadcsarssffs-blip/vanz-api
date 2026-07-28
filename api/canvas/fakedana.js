import axios from "axios"
import FormData from "form-data"
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas"
import fs from "fs"
import path from "path"

const TMP = "/tmp"

const FONT_URL = "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-600-normal.ttf"
const BG_URL = "https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/fkedana.png"
const ICON_URL = "https://raw.githubusercontent.com/ryyntwx/Image-rinn/refs/heads/main/IMG-20260726-WA1031.jpg"

const FONT_PATH = path.join(TMP, "jakarta.ttf")

let loaded = false

async function getBuffer(url) {
    const res = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    })

    return Buffer.from(res.data)
}

async function loadAssets() {
    if (loaded) return

    if (!fs.existsSync(FONT_PATH)) {
        const font = await getBuffer(FONT_URL)
        fs.writeFileSync(FONT_PATH, font)
    }

    try {
        GlobalFonts.registerFromPath(FONT_PATH, "Jakarta")
    } catch {}

    loaded = true
}


async function uploadImage(buffer) {
    const form = new FormData()

    form.append("file", buffer, {
        filename: "fakedana.png",
        contentType: "image/png"
    })

    const res = await axios.post(
        "https://cloud.yardansh.com/upload",
        form,
        {
            headers: form.getHeaders()
        }
    )

    return res.data.url
}


export default async function handler(req, res) {
    try {

        const { saldo, response } = req.query


        if (!saldo) {
            return res.status(400).json({
                status: false,
                code: 400,
                creator: "VanzWeb",
                message: "Missing required parameter.",
                idea: "by Rin"
            })
        }


        await loadAssets()


        const [bgBuffer, iconBuffer] = await Promise.all([
            getBuffer(BG_URL),
            getBuffer(ICON_URL)
        ])


        const bg = await loadImage(bgBuffer)
        const icon = await loadImage(iconBuffer)


        const canvas = createCanvas(
            bg.width,
            bg.height
        )

        const ctx = canvas.getContext("2d")


        ctx.drawImage(
            bg,
            0,
            0,
            canvas.width,
            canvas.height
        )


        const text = saldo.toString()

        let size = 40

        ctx.font = `${size}px Jakarta`

        while (
            ctx.measureText(text).width > 350 &&
            size > 15
        ) {
            size -= 2
            ctx.font = `${size}px Jakarta`
        }


        ctx.fillStyle = "#ffffff"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"

        const x = 150
        const y = 80


        ctx.fillText(
            text,
            x,
            y
        )


        ctx.drawImage(
            icon,
            x + ctx.measureText(text).width + 15,
            y - 15,
            30,
            30
        )


        const buffer = await canvas.encode("png")


        // optional JSON base64
        if (response === "json") {
            return res.status(200).json({
                status: true,
                creator: "VanzWeb",
                idea: "by Rin",
                result:
                    `data:image/png;base64,${buffer.toString("base64")}`
            })
        }


        // optional proxy uploader
        // const url = await uploadImage(buffer)
        // const img = await axios.get(url, {
        //     responseType: "arraybuffer"
        // })
        // return res.send(Buffer.from(img.data))


        res.setHeader(
            "Content-Type",
            "image/png"
        )

        res.setHeader(
            "Cache-Control",
            "public, max-age=86400"
        )

        return res.status(200).send(buffer)


    } catch (e) {

        return res.status(500).json({
            status: false,
            code: 500,
            creator: "VanzWeb",
            message: e.message,
            idea: "by Rin"
        })

    }
}
