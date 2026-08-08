import compressedCatalog from './catalog.gz.b64?raw'

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

const iconUrl = (category: 'gear' | 'materials' | 'tools', name: string) =>
  `${import.meta.env.BASE_URL}assets/icons/${category}/${slug(name)}.webp`

for (const item of catalog.items ?? []) {
  const category = item.kind === 'Profession Tool' ? 'tools' : 'gear'
  item.icon = iconUrl(category, item.name)
  item.iconIndex = null
}

for (const material of catalog.materials ?? []) {
  material.icon = iconUrl('materials', material.name)
  material.iconIndex = null
}

export default catalog
