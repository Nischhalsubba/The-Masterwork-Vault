import { mkdir, readFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const ATLAS_PATH = path.join(ROOT, 'src', 'data', 'sprite.b64')
const MANIFEST_PATH = path.join(ROOT, 'scripts', 'icon-manifest.json')
const OUTPUT_ROOT = path.join(ROOT, 'public', 'assets', 'icons')
const TILE_SIZE = 48
const COLUMNS = 10

const [atlasText, manifestText] = await Promise.all([
  readFile(ATLAS_PATH, 'utf8'),
  readFile(MANIFEST_PATH, 'utf8'),
])

const manifest = JSON.parse(manifestText)
if (!Array.isArray(manifest) || manifest.length !== 90) {
  throw new Error(`Expected 90 verified icon entries, got ${Array.isArray(manifest) ? manifest.length : 'invalid manifest'}`)
}

const atlas = Buffer.from(atlasText.replace(/\s+/g, ''), 'base64')
const metadata = await sharp(atlas).metadata()
const expectedRows = Math.ceil(manifest.length / COLUMNS)
const expectedWidth = COLUMNS * TILE_SIZE
const expectedHeight = expectedRows * TILE_SIZE

if (metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
  throw new Error(`Verified icon atlas is ${metadata.width}x${metadata.height}; expected ${expectedWidth}x${expectedHeight}`)
}

await rm(OUTPUT_ROOT, { recursive: true, force: true })
await mkdir(OUTPUT_ROOT, { recursive: true })

await Promise.all(manifest.map(async (relativePath, index) => {
  const left = (index % COLUMNS) * TILE_SIZE
  const top = Math.floor(index / COLUMNS) * TILE_SIZE
  const outputPath = path.join(OUTPUT_ROOT, relativePath)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await sharp(atlas)
    .extract({ left, top, width: TILE_SIZE, height: TILE_SIZE })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath)
}))

for (const relativePath of manifest) {
  const info = await stat(path.join(OUTPUT_ROOT, relativePath))
  if (info.size <= 100) throw new Error(`Generated icon is unexpectedly small: ${relativePath}`)
}

console.log(`Prepared ${manifest.length} individually named verified icons in public/assets/icons`)
