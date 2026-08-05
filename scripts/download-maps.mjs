import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'maps')

const MAPS = [
  { id: 'customs', file: 'Customs Interactive Map Base.png', ext: 'png' },
  { id: 'factory', file: 'Factory Interactive Map Base.jpg', ext: 'jpg' },
  { id: 'ground-zero', file: 'Ground Zero Interactive Map Base.png', ext: 'png' },
  { id: 'interchange', file: 'Interchange Interactive Map Base.webp', ext: 'webp' },
  { id: 'lighthouse', file: 'Lighthouse Interactive Map Base.png', ext: 'png' },
  { id: 'reserve', file: 'Reserve Interactive Map Base.png', ext: 'png' },
  { id: 'shoreline', file: 'Shoreline Interactive Map Base.png', ext: 'png' },
  { id: 'streets', file: 'Streets of Tarkov Interactive Map Base.png', ext: 'png' },
  { id: 'terminal', file: 'Terminal Interactive Map Base.png', ext: 'png' },
  { id: 'the-lab', file: 'The Lab Interactive Map Base.png', ext: 'png' },
  { id: 'the-labyrinth', file: 'The Labyrinth Interactive Map Base.png', ext: 'png' },
  { id: 'woods', file: 'Woods Interactive Map Base.png', ext: 'png' },
]

const API =
  'https://escapefromtarkov.fandom.com/api.php?action=query&prop=imageinfo&iiprop=url|size&format=json&titles='

async function resolveUrl(fileName) {
  const title = `File:${fileName}`
  const res = await fetch(`${API}${encodeURIComponent(title)}`, {
    headers: { 'User-Agent': 'TarkovMapsApp/1.0 (local download script)' },
  })
  if (!res.ok) throw new Error(`API ${res.status} for ${fileName}`)
  const json = await res.json()
  const page = Object.values(json.query.pages)[0]
  const info = page?.imageinfo?.[0]
  if (!info?.url) throw new Error(`No image URL for ${fileName}`)
  return { url: info.url, width: info.width, height: info.height }
}

async function downloadOne(map) {
  const { url, width, height } = await resolveUrl(map.file)
  console.log(`↓ ${map.id} (${width}×${height})`)
  const imgRes = await fetch(url, {
    headers: { 'User-Agent': 'TarkovMapsApp/1.0 (local download script)' },
  })
  if (!imgRes.ok) throw new Error(`Download ${imgRes.status}: ${map.id}`)
  const buf = Buffer.from(await imgRes.arrayBuffer())
  const dest = join(outDir, `${map.id}.${map.ext}`)
  await writeFile(dest, buf)
  console.log(`  saved ${dest} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`)
  return { ...map, width, height }
}

await mkdir(outDir, { recursive: true })

const results = []
for (const map of MAPS) {
  try {
    results.push(await downloadOne(map))
  } catch (err) {
    console.error(`✗ ${map.id}:`, err.message)
    process.exitCode = 1
  }
}

console.log(`\nDone: ${results.length}/${MAPS.length}`)
