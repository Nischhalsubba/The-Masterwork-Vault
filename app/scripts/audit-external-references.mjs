/**
 * Bounded live HTTP reachability audit for external links referenced by
 * generated public guide pages. Reachability is NOT evidence of game accuracy.
 * Bot challenges, 403/429/503, and timeouts stay explicitly inconclusive.
 */
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {extractExternalReferences, classifyReferenceResponse} from './lib/reference-audit.mjs'

const root = path.resolve('dist')
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
const references = new Map()
let occurrences = 0
let pages = 0
for (const source of urls) {
  const sourceUrl = new URL(source)
  if (!sourceUrl.pathname.startsWith('/guides/')) continue
  const file = path.join(root, sourceUrl.pathname.slice(1), 'index.html')
  const html = await readFile(file, 'utf8')
  pages++
  for (const target of extractExternalReferences(html, source)) {
    occurrences++
    if (!references.has(target)) references.set(target, new Set())
    references.get(target).add(source)
  }
}

async function inspect(target) {
  try {
    const res = await fetch(target, {
      redirect: 'follow', signal: AbortSignal.timeout(8000),
      headers: {'User-Agent': 'MasterworkVault-Reference-Audit/1.0 (+https://neverwintermastercraft.netlify.app/)'},
    })
    const record = {
      url: target, status: classifyReferenceResponse(res.status, res.redirected),
      httpStatus: res.status, finalUrl: res.url,
      referencedBy: [...references.get(target)],
    }
    await res.body?.cancel()
    return record
  } catch (error) {
    return {
      url: target, status: 'inconclusive-network-failure',
      reason: error?.name === 'TimeoutError' ? 'Request timeout' : String(error?.message || error).slice(0, 100),
      referencedBy: [...references.get(target)],
    }
  }
}

const entries = [...references.keys()]
const records = []
const concurrency = 3
for (let i = 0; i < entries.length; i += concurrency) {
  const next = await Promise.all(entries.slice(i, i + concurrency).map(inspect))
  records.push(...next)
  if (i + concurrency < entries.length) await new Promise(resolve => setTimeout(resolve, 250))
}
const counts = Object.fromEntries([...new Set(records.map(record => record.status))].map(status => [
  status, records.filter(record => record.status === status).length,
]))
const summary = {
  checkedAt: new Date().toISOString(),
  kind: 'HTTP link reachability only — not source-content or Neverwinter game-mechanics verification',
  guidePagesChecked: pages, sourceLinkOccurrences: occurrences,
  uniqueExternalURLs: entries.length, counts, references: records,
}
await mkdir('link-audit-results', {recursive: true})
await writeFile('link-audit-results/external-references.json', JSON.stringify(summary, null, 2) + '\n')
console.log(JSON.stringify({checkedAt: summary.checkedAt, guidePagesChecked: pages, sourceLinkOccurrences: occurrences, uniqueExternalURLs: entries.length, counts}, null, 2))
if (counts['not-found']) console.warn('Review HTTP 404/410 references in link-audit-results/external-references.json before replacement.')
console.log('External HTTP reachability does not verify the content of a crafting source or guarantee continued validity.')
