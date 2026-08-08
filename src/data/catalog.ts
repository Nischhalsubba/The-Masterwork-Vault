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

const iconByName = new Map<string, string>()
for (const [key, source] of Object.entries(iconData)) {
  const name = key.slice(key.indexOf('/') + 1)
  iconByName.set(slug(name), source)
}

const blobCache = new Map<string, string>()
const asRenderableUrl = (source?: string | null): string | null => {
  if (!source) return null
  if (!source.startsWith('data:image/webp;base64,')) return source

  const cached = blobCache.get(source)
  if (cached) return cached

  try {
    const encoded = source.slice(source.indexOf(',') + 1).replace(/\s+/g, '')
    const binary = atob(encoded)
    const data = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) data[i] = binary.charCodeAt(i)
    const url = URL.createObjectURL(new Blob([data], { type: 'image/webp' }))
    blobCache.set(source, url)
    return url
  } catch {
    return source
  }
}

const mappedIcon = (category: 'gear' | 'materials' | 'tools', name: string, fallback?: string | null) => {
  const key = slug(name)
  const source = iconData[`${category}/${key}`] ?? iconByName.get(key) ?? fallback ?? null
  return asRenderableUrl(source)
}

let itemIconCount = 0
for (const item of catalog.items ?? []) {
  const category = item.kind === 'Profession Tool' ? 'tools' : 'gear'
  item.icon = mappedIcon(category, item.name, item.icon)
  item.iconIndex = null
  if (item.icon) itemIconCount += 1
}

let materialIconCount = 0
for (const material of catalog.materials ?? []) {
  material.icon = mappedIcon('materials', material.name, material.icon)
  material.iconIndex = null
  if (material.icon) materialIconCount += 1
}

console.info(`Icon audit: ${itemIconCount}/${catalog.items?.length ?? 0} craftables and ${materialIconCount}/${catalog.materials?.length ?? 0} materials mapped`)

export default catalog
