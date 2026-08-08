import compressedCatalog from './catalog.gz.b64?raw'

const bytes = Uint8Array.from(atob(compressedCatalog.replace(/\s+/g, '')), (char) => char.charCodeAt(0))
const stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))
const text = await new Response(stream).text()
const catalog = JSON.parse(text)

// Each catalog item and material already contains its own verified icon as a
// small data:image/webp;base64 URL. Keep that value untouched and render it
// directly with <img>. There is no sprite, icon index, generated asset, or
// secondary image lookup in the runtime path.
for (const item of catalog.items ?? []) item.iconIndex = null
for (const material of catalog.materials ?? []) material.iconIndex = null

export default catalog
