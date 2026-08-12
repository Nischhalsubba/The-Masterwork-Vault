import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/components/MobileV4Shell.tsx'
let source = await readFile(path, 'utf8')
const from = `  const navigate = (index: number) => {\n    sourceButtons()[index]?.click()\n    setActiveTab(index)`
const to = `  const navigate = (index: number) => {\n    const view = ['catalog', 'plan', 'materials', 'reference'][index]\n    if (view) document.dispatchEvent(new CustomEvent('masterwork:request-route', { detail: { view } }))\n    setActiveTab(index)`
if (!source.includes(to)) {
  if (!source.includes(from)) throw new Error('Mobile navigation patch target not found')
  source = source.replace(from, to)
}
await writeFile(path, source)
console.log('Mobile navigation decoupled from desktop button clicks.')
