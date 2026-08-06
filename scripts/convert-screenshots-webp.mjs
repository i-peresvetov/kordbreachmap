/**
 * Convert non-WebP images under public/screenshots/ to WebP (q95).
 * Drop jpg/png/… into map folders, then run: npm run screenshots:webp
 *
 * Flags:
 *   --force   rebuild WebP even if it already exists
 *   --remove-source  delete the source file after a successful convert
 */
import {
  readdirSync,
  statSync,
  writeFileSync,
  existsSync,
  unlinkSync,
} from 'node:fs'
import { join, extname, basename, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SHOTS = join(ROOT, 'public', 'screenshots')
const SOURCE_EXTS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.bmp',
  '.tif',
  '.tiff',
  '.avif',
])
const QUALITY = 95
const force = process.argv.includes('--force')
const removeSource = process.argv.includes('--remove-source')

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue
    const full = join(dir, name)
    const st = statSync(full)
    if (st.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

const sources = walk(SHOTS).filter((f) =>
  SOURCE_EXTS.has(extname(f).toLowerCase()),
)

if (sources.length === 0) {
  console.log('No non-WebP screenshots to convert.')
  process.exit(0)
}

let created = 0
let skipped = 0
let failed = 0
let removed = 0
let srcBytes = 0
let webpBytes = 0

for (const src of sources) {
  const webpPath = join(dirname(src), `${basename(src, extname(src))}.webp`)
  const srcSize = statSync(src).size
  srcBytes += srcSize
  const rel = src.slice(SHOTS.length + 1)

  if (existsSync(webpPath) && !force) {
    webpBytes += statSync(webpPath).size
    skipped++
    if (removeSource) {
      unlinkSync(src)
      removed++
      console.log(`KEEP webp, removed source  ${rel}`)
    }
    continue
  }

  try {
    const out = await sharp(src).webp({ quality: QUALITY, effort: 6 }).toBuffer()
    writeFileSync(webpPath, out)
    webpBytes += out.length
    created++
    console.log(
      `OK  ${(srcSize / 1e6).toFixed(2)}→${(out.length / 1e6).toFixed(2)} MB  ${rel}`,
    )
    if (removeSource) {
      unlinkSync(src)
      removed++
    }
  } catch (err) {
    failed++
    console.error(`FAIL ${rel}:`, err instanceof Error ? err.message : err)
  }
}

console.log('---')
console.log(
  JSON.stringify(
    {
      sources: sources.length,
      created,
      skippedExistingWebp: skipped,
      removedSources: removed,
      failed,
      originalsMB: +(srcBytes / 1e6).toFixed(1),
      webpWrittenMB: +(webpBytes / 1e6).toFixed(1),
      force,
      removeSource,
    },
    null,
    2,
  ),
)

if (failed > 0) process.exit(1)
