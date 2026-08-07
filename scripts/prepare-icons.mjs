import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'src', 'data', 'sprite.b64')
const MANIFEST = path.join(ROOT, 'scripts', 'icon-manifest.json')
const OUTPUT_DIR = path.join(ROOT, 'public', 'assets', 'icons')
const OUTPUT = path.join(OUTPUT_DIR, 'verified-atlas.webp')

const [encoded, manifestText] = await Promise.all([
  readFile(SOURCE, 'utf8'),
  readFile(MANIFEST, 'utf8'),
])

const manifest = JSON.parse(manifestText)
if (!Array.isArray(manifest) || manifest.length !== 90) {
  throw new Error(`Expected 90 verified icons, got ${Array.isArray(manifest) ? manifest.length : 'invalid manifest'}`)
}

const atlas = Buffer.from(encoded.replace(/\s+/g, ''), 'base64')
if (atlas.length < 1000 || atlas.toString('ascii', 0, 4) !== 'RIFF' || atlas.toString('ascii', 8, 12) !== 'WEBP') {
  throw new Error('Verified icon atlas is not a valid WebP payload')
}

await mkdir(OUTPUT_DIR, { recursive: true })
await writeFile(OUTPUT, atlas)
console.log(`Prepared normal static verified atlas (${atlas.length} bytes) for ${manifest.length} named catalog icons`)
