import compressedCatalog from './catalog.gz.b64?raw'
import { verifiedIconIndex, verifiedIconCount } from './verifiedIconIndex'

const bytes = Uint8Array.from(atob(compressedCatalog), (char) => char.charCodeAt(0))
const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))
const text = await new Response(stream).text()
const catalog = JSON.parse(text)

for (const item of catalog.items ?? []) {
  const category = item.kind === 'Profession Tool' ? 'tools' : 'gear'
  const index = verifiedIconIndex(item.name, category)
  item.icon = null
  item.iconIndex = index ?? null
}

for (const material of catalog.materials ?? []) {
  const index = verifiedIconIndex(material.name, 'materials')
  material.icon = null
  material.iconIndex = index ?? null
}

catalog.meta.sprite = {
  ...(catalog.meta.sprite ?? {}),
  tileSize: 48,
  columns: 10,
  count: verifiedIconCount,
  source: `${import.meta.env.BASE_URL}assets/icons/verified-atlas.webp`,
  transport: 'normal-static-file',
}

export default catalog
