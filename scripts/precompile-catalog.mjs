import { readFile, writeFile } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'

const encoded = (await readFile('src/data/catalog.gz.b64', 'utf8')).replace(/\s+/g, '')
const json = gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8')
JSON.parse(json)
await writeFile('src/data/catalog.generated.ts', `// Generated during prebuild. Do not edit.\nexport default ${json} as any\n`)

const path = 'src/data/catalog.ts'
let source = await readFile(path, 'utf8')
const runtimeImport = "import compressedCatalog from './catalog.gz.b64?raw'"
const runtimeDecode = "const bytes = Uint8Array.from(atob(compressedCatalog.replace(/\\s+/g, '')), (char) => char.charCodeAt(0))\nconst stream = new Blob([bytes.buffer as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('gzip'))\nconst text = await new Response(stream).text()\nconst catalog = JSON.parse(text)"

if (source.includes(runtimeImport)) source = source.replace(runtimeImport, "import generatedCatalog from './catalog.generated'")
if (source.includes(runtimeDecode)) source = source.replace(runtimeDecode, 'const catalog = structuredClone(generatedCatalog)')
if (!source.includes("import generatedCatalog from './catalog.generated'")) throw new Error('Could not replace runtime catalog import')
if (!source.includes('const catalog = structuredClone(generatedCatalog)')) throw new Error('Could not replace runtime catalog decompression')
await writeFile(path, source)
console.log('Catalog precompiled for browser startup.')
