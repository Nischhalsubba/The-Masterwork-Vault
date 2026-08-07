import { mkdir, readFile, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'
import sharp from 'sharp'

const ROOT = process.cwd()
const ATLAS_PATH = path.join(ROOT, 'src', 'data', 'sprite.b64')
const CATALOG_PATH = path.join(ROOT, 'src', 'data', 'catalog.gz.b64')
const MANIFEST_PATH = path.join(ROOT, 'scripts', 'icon-manifest.json')
const OUTPUT_ROOT = path.join(ROOT, 'public', 'assets', 'icons')
const COLUMNS = 10

const slug = (value) => value
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const iconRelativePath = (category, name) => {
  let filename = slug(name)
  if (category === 'tools' && !filename.startsWith('duergar-mercenarys-')) {
    filename = `duergar-mercenarys-${filename}`
  }
  return `${category}/${filename}.png`
}

const [atlasText, catalogText, manifestText] = await Promise.all([
  readFile(ATLAS_PATH, 'utf8'),
  readFile(CATALOG_PATH, 'utf8'),
  readFile(MANIFEST_PATH, 'utf8'),
])

const manifest = JSON.parse(manifestText)
if (!Array.isArray(manifest) || manifest.length !== 90) {
  throw new Error(`Expected 90 verified icon entries, got ${Array.isArray(manifest) ? manifest.length : 'invalid manifest'}`)
}

const catalog = JSON.parse(gunzipSync(Buffer.from(catalogText.replace(/\s+/g, ''), 'base64')).toString('utf8'))
const manifestSet = new Set(manifest)
const expectedPaths = [
  ...(catalog.items ?? []).map((item) => iconRelativePath(item.kind === 'Profession Tool' ? 'tools' : 'gear', item.name)),
  ...(catalog.materials ?? []).map((material) => iconRelativePath('materials', material.name)),
]
const missingMappings = [...new Set(expectedPaths.filter((relativePath) => !manifestSet.has(relativePath)))]
if (missingMappings.length) {
  throw new Error(`Verified icon manifest is missing catalog mappings:\n${missingMappings.join('\n')}`)
}

const atlas = Buffer.from(atlasText.replace(/\s+/g, ''), 'base64')
const metadata = await sharp(atlas).metadata()
const rows = Math.ceil(manifest.length / COLUMNS)

if (!metadata.width || !metadata.height || metadata.width % COLUMNS !== 0 || metadata.height % rows !== 0) {
  throw new Error(`Verified icon atlas has invalid dimensions: ${metadata.width}x${metadata.height}`)
}

const tileWidth = metadata.width / COLUMNS
const tileHeight = metadata.height / rows
if (tileWidth !== tileHeight) {
  throw new Error(`Verified icon atlas tiles are not square: ${tileWidth}x${tileHeight}`)
}
const tileSize = tileWidth

await rm(OUTPUT_ROOT, { recursive: true, force: true })
await mkdir(OUTPUT_ROOT, { recursive: true })

await Promise.all(manifest.map(async (relativePath, index) => {
  const left = (index % COLUMNS) * tileSize
  const top = Math.floor(index / COLUMNS) * tileSize
  const outputPath = path.join(OUTPUT_ROOT, relativePath)
  await mkdir(path.dirname(outputPath), { recursive: true })
  await sharp(atlas)
    .extract({ left, top, width: tileSize, height: tileSize })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath)
}))

for (const relativePath of manifest) {
  const info = await stat(path.join(OUTPUT_ROOT, relativePath))
  if (info.size <= 100) throw new Error(`Generated icon is unexpectedly small: ${relativePath}`)
}

console.log(`Prepared ${manifest.length} individually named verified icons (${tileSize}x${tileSize}) in public/assets/icons`)
console.log(`Verified ${expectedPaths.length} catalog icon references against the generated files`)
