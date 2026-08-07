import compressedCatalog from './catalog.gz.b64?raw'
import { verifiedIconIndex, verifiedIconCount } from './verifiedIconIndex'

const bytes = Uint8Array.from(atob(compressedCatalog), (char) => char.charCodeAt(0))
const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))
const text = await new Response(stream).text()
const catalog = JSON.parse(text)

for (const item of catalog.items ?? []) {
  const category = item.kind === 'Profession Tool' ? 'tools' : 'gear'
  const index = verifiedIconIndex(item.name, category)
  if (index !== undefined) {
    item.icon = null
    item.iconIndex = index
  }
}

for (const material of catalog.materials ?? []) {
  const index = verifiedIconIndex(material.name, 'materials')
  if (index !== undefined) {
    material.icon = null
    material.iconIndex = index
  }
}

catalog.meta.sprite = {
  ...(catalog.meta.sprite ?? {}),
  tileSize: 70,
  columns: 10,
  count: verifiedIconCount,
}

export default catalog