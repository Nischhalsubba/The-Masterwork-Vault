import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'src', 'data', 'catalog.gz.b64')
const OUTPUT_ROOT = path.join(ROOT, 'public', 'assets', 'icons')

const slug = (name) => name
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const encodedCatalog = (await readFile(SOURCE, 'utf8')).replace(/\s+/g, '')
const catalog = JSON.parse(gunzipSync(Buffer.from(encodedCatalog, 'base64')).toString('utf8'))
const items = catalog.items ?? []
const materials = catalog.materials ?? []

await rm(OUTPUT_ROOT, { recursive: true, force: true })
await Promise.all([
  mkdir(path.join(OUTPUT_ROOT, 'gear'), { recursive: true }),
  mkdir(path.join(OUTPUT_ROOT, 'materials'), { recursive: true }),
  mkdir(path.join(OUTPUT_ROOT, 'tools'), { recursive: true }),
])

const written = new Set()

const writeIcon = async (entity, category) => {
  const source = entity.icon
  const match = typeof source === 'string'
    ? /^data:image\/webp;base64,([A-Za-z0-9+/=\s]+)$/.exec(source)
    : null

  if (!match) {
    throw new Error(`Missing embedded WebP icon for ${entity.name}`)
  }

  const fileName = `${slug(entity.name)}.webp`
  const relativePath = `${category}/${fileName}`
  if (written.has(relativePath)) {
    throw new Error(`Duplicate icon path: ${relativePath}`)
  }

  const bytes = Buffer.from(match[1].replace(/\s+/g, ''), 'base64')
  if (
    bytes.length < 100 ||
    bytes.toString('ascii', 0, 4) !== 'RIFF' ||
    bytes.toString('ascii', 8, 12) !== 'WEBP'
  ) {
    throw new Error(`Invalid WebP payload for ${entity.name}`)
  }

  await writeFile(path.join(OUTPUT_ROOT, relativePath), bytes)
  written.add(relativePath)
}

for (const item of items) {
  await writeIcon(item, item.kind === 'Profession Tool' ? 'tools' : 'gear')
}
for (const material of materials) {
  await writeIcon(material, 'materials')
}

const expected = items.length + materials.length
if (written.size !== expected) {
  throw new Error(`Icon audit expected ${expected} files, wrote ${written.size}`)
}

const gearCount = items.filter((item) => item.kind !== 'Profession Tool').length
const toolCount = items.filter((item) => item.kind === 'Profession Tool').length
console.log(`Direct icon audit passed: ${gearCount} gear/accessory + ${toolCount} tools + ${materials.length} materials = ${written.size}/${expected} static WebP files`)
