import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { screenshotIndexPlugin } from './vite.screenshotIndex.ts'

const rootDir = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(
  readFileSync(join(rootDir, 'package.json'), 'utf-8'),
) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  base: '/kordbreachmap/',
  plugins: [
    react(),
    screenshotIndexPlugin(join(rootDir, 'public', 'screenshots')),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
})
