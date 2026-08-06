import { readdirSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:screenshot-index'
const RESOLVED_ID = `\0${VIRTUAL_ID}`
const ALLOWED_EXTS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif'])

/** Prefer modern/smaller formats when several files share the same stem. */
const EXT_PRIORITY: Record<string, number> = {
  webp: 5,
  avif: 4,
  jpg: 3,
  jpeg: 3,
  png: 2,
  gif: 1,
}

/** Scan public/screenshots → { "mapId/point name": "webp" } */
export function scanScreenshotIndex(screenshotsDir: string): Record<string, string> {
  const index: Record<string, string> = {}
  let mapDirs: string[]
  try {
    mapDirs = readdirSync(screenshotsDir)
  } catch {
    return index
  }

  for (const mapId of mapDirs) {
    const mapDir = join(screenshotsDir, mapId)
    if (!statSync(mapDir).isDirectory()) continue
    for (const file of readdirSync(mapDir)) {
      if (file.startsWith('.')) continue
      const ext = extname(file).slice(1).toLowerCase()
      if (!ALLOWED_EXTS.has(ext)) continue
      const name = basename(file, extname(file))
      const key = `${mapId}/${name}`
      const prev = index[key]
      if (!prev || (EXT_PRIORITY[ext] ?? 0) > (EXT_PRIORITY[prev] ?? 0)) {
        index[key] = ext
      }
    }
  }
  return index
}

/** Vite plugin: `import index from 'virtual:screenshot-index'`. */
export function screenshotIndexPlugin(screenshotsDir: string): Plugin {
  return {
    name: 'screenshot-index',
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      const index = scanScreenshotIndex(screenshotsDir)
      return `export default ${JSON.stringify(index)}`
    },
    configureServer(server) {
      server.watcher.add(screenshotsDir)
      const reload = (file: string) => {
        if (!file.replace(/\\/g, '/').includes('/screenshots/')) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) void server.reloadModule(mod)
      }
      server.watcher.on('add', reload)
      server.watcher.on('unlink', reload)
      server.watcher.on('change', reload)
    },
  }
}
