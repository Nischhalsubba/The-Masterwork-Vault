import compressedCatalog from './catalog.gz.b64?raw'

const bytes = Uint8Array.from(atob(compressedCatalog), (char) => char.charCodeAt(0))
const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
const text = await new Response(stream).text()
const catalog = JSON.parse(text)

export default catalog
