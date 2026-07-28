import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const __dirname = process.cwd()

const FONT_PATH = path.join(__dirname, 'assets', 'fakedana', 'fonts', 'PlusJakartaSans-SemiBold.ttf')
const BG_PATH = path.join(__dirname, 'assets', 'fakedana', 'fkedana.png')
const EYE_PATH = path.join(__dirname, 'assets', 'fakedana', 'eye_icon.jpg')

GlobalFonts.registerFromPath(FONT_PATH, 'DANA')

export default async function handler(req, res) {
    try {
        const { saldo } = req.query

        if (!saldo) {
            return res.status(400).json({
                status: false,
                code: 400,
                creator: 'VanzWeb',
                message: 'Missing required parameter.',
                thanks: 'Rin Imup for the scrape'
            })
        }

        const bg = await loadImage(await readFile(BG_PATH))
        const eye = await loadImage(await readFile(EYE_PATH))

        const canvas = createCanvas(bg.width, bg.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(bg, 0, 0)

        const valX = 138
        const valY = 52
        const maxFontSize = 37
        const eyeGap = 7
        const eyeScale = 1.3

        let fontSize = maxFontSize

        ctx.font = `600 ${fontSize}px DANA`

        let textWidth = ctx.measureText(saldo).width
        const maxWidth = canvas.width - valX - 100

        while (textWidth > maxWidth && fontSize > 16) {
            fontSize -= 2
            ctx.font = `600 ${fontSize}px DANA`
            textWidth = ctx.measureText(saldo).width
        }

        ctx.fillStyle = '#FFFFFF'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(saldo, valX, valY)

        const eyeHeight = fontSize * eyeScale
        const eyeWidth = (eye.width / eye.height) * eyeHeight

        ctx.drawImage(
            eye,
            valX + textWidth + eyeGap,
            valY + (fontSize - eyeHeight) / 2,
            eyeWidth,
            eyeHeight
        )

        const buffer = await canvas.encode('png')

        res.setHeader('Content-Type', 'image/png')
        res.setHeader('Content-Disposition', 'inline; filename="fakedana.png"')
        res.setHeader('Cache-Control', 'public, max-age=86400')

        return res.status(200).send(buffer)

    } catch (err) {
        console.error(err)

        return res.status(500).json({
            status: false,
            code: 500,
            creator: 'VanzWeb',
            message: err.message,
            thanks: 'Rin Imup for the scrape'
        })
    }
}
