import { readFileSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import { createRequire } from 'node:module'

// Use dynamic import after ensuring pngjs is available
const srcPath = process.argv[2]
const outPath = process.argv[3]
const size = Number(process.argv[4] || 64)

const raw = readFileSync(srcPath)
const png = PNG.sync.read(raw)
const { width: w, height: h, data } = png

const idx = (x, y) => (w * y + x) << 2
const isBg = (i) => data[i] >= 230 && data[i + 1] >= 230 && data[i + 2] >= 230

const bg = new Uint8Array(w * h)
const q = []
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= w || y >= h) return
  const p = y * w + x
  if (bg[p]) return
  if (!isBg(idx(x, y))) return
  bg[p] = 1
  q.push(p)
}

for (let x = 0; x < w; x++) {
  push(x, 0)
  push(x, h - 1)
}
for (let y = 0; y < h; y++) {
  push(0, y)
  push(w - 1, y)
}

while (q.length) {
  const p = q.pop()
  const x = p % w
  const y = (p / w) | 0
  push(x + 1, y)
  push(x - 1, y)
  push(x, y + 1)
  push(x, y - 1)
}

const content = new Uint8Array(w * h)
for (let i = 0; i < content.length; i++) content[i] = bg[i] ? 0 : 1

const radius = 14
const r2 = radius * radius
const outline = new Uint8Array(w * h)
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (!content[y * w + x]) continue
    const y0 = Math.max(0, y - radius)
    const y1 = Math.min(h - 1, y + radius)
    const x0 = Math.max(0, x - radius)
    const x1 = Math.min(w - 1, x + radius)
    for (let yy = y0; yy <= y1; yy++) {
      const dy = yy - y
      for (let xx = x0; xx <= x1; xx++) {
        const dx = xx - x
        if (dx * dx + dy * dy <= r2) outline[yy * w + xx] = 1
      }
    }
  }
}

const out = Buffer.alloc(w * h * 4)
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const p = y * w + x
    const i = p << 2
    const o = i
    if (content[p]) {
      out[o] = data[i]
      out[o + 1] = data[i + 1]
      out[o + 2] = data[i + 2]
      out[o + 3] = 255
    } else if (outline[p]) {
      out[o] = 255
      out[o + 1] = 255
      out[o + 2] = 255
      out[o + 3] = 255
    } else {
      out[o + 3] = 0
    }
  }
}

// Crop
let minX = w,
  minY = h,
  maxX = 0,
  maxY = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    if (out[((y * w + x) << 2) + 3] > 0) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
}
const pad = 4
minX = Math.max(0, minX - pad)
minY = Math.max(0, minY - pad)
maxX = Math.min(w - 1, maxX + pad)
maxY = Math.min(h - 1, maxY + pad)
const cw = maxX - minX + 1
const ch = maxY - minY + 1

const cropped = new PNG({ width: cw, height: ch })
for (let y = 0; y < ch; y++) {
  for (let x = 0; x < cw; x++) {
    const si = ((minY + y) * w + (minX + x)) << 2
    const di = (y * cw + x) << 2
    cropped.data[di] = out[si]
    cropped.data[di + 1] = out[si + 1]
    cropped.data[di + 2] = out[si + 2]
    cropped.data[di + 3] = out[si + 3]
  }
}

// Nearest/bilinear scale to size x size
const scaled = new PNG({ width: size, height: size })
for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const sx = Math.min(cw - 1, Math.floor((x + 0.5) * (cw / size)))
    const sy = Math.min(ch - 1, Math.floor((y + 0.5) * (ch / size)))
    const si = (sy * cw + sx) << 2
    const di = (y * size + x) << 2
    scaled.data[di] = cropped.data[si]
    scaled.data[di + 1] = cropped.data[si + 1]
    scaled.data[di + 2] = cropped.data[si + 2]
    scaled.data[di + 3] = cropped.data[si + 3]
  }
}

writeFileSync(outPath, PNG.sync.write(scaled))
console.log('wrote', outPath, `${size}x${size}`)
