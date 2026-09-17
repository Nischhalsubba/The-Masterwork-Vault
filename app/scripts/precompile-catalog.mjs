import { readFile, writeFile } from 'node:fs/promises'
import { gunzipSync } from 'node:zlib'

const encoded = (await readFile('src/data/catalog.gz.b64', 'utf8')).replace(/\s+/g, '')
const json = gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8')
JSON.parse(json)
await writeFile('src/data/catalog.generated.ts', `// Generated during prebuild. Do not edit.\nexport default ${json} as any\n`)

console.log('Catalog data generated; authored source remains unchanged.')
