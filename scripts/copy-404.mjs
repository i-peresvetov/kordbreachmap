import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '..', 'dist')
copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
console.log('Copied dist/index.html → dist/404.html')
