import compressedCatalog from './catalog.gz.b64?raw'
import iconData from './iconData'

const bytes = Uint8Array.from(atob(compressedCatalog.replace(/\s+/g, '')), (char) => char.charCodeAt(0))
const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))
const text = await new Response(stream).text()
const catalog = JSON.parse(text)

const slug = (name: string) => name
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

// The verified screenshot-derived icon map is bundled as data:image/webp URLs.
// Apply it to every runtime catalog entry so the UI receives a real image src.
for (const item of catalog.items ?? []) {
  const category = item.kind === 'Profession Tool' ? 'tools' : 'gear'
  item.icon = iconData[`${category}/${slug(item.name)}`] ?? item.icon ?? null
  item.iconIndex = null
}

for (const material of catalog.materials ?? []) {
  material.icon = iconData[`materials/${slug(material.name)}`] ?? material.icon ?? null
  material.iconIndex = null
}

export default catalog
