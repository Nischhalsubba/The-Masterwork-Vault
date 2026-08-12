import { readFile, writeFile } from 'node:fs/promises'

async function patch(path, edits) {
  let source = await readFile(path, 'utf8')
  for (const { from, to } of edits) {
    if (source.includes(to)) continue
    if (!source.includes(from)) throw new Error(`Next-level integration target not found in ${path}: ${from.slice(0, 100)}`)
    source = source.replace(from, to)
  }
  await writeFile(path, source)
}

await patch('src/App.tsx', [
  {
    from: "import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'",
    to: "import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'\nimport { requestAppRoute } from './lib/navigation'",
  },
  {
    from: "<button data-view={v} className={view === v ? 'active' : ''} onClick={() => setView(v)} key={v}>",
    to: "<button data-view={v} className={view === v ? 'active' : ''} onClick={() => requestAppRoute({ view: v })} key={v}>",
  },
  {
    from: "<button className=\"item-main\" data-item-id={entry.id} data-item-campaign={entry.campaign || ''} onClick={() => setId(entry.id)}>",
    to: "<button className=\"item-main\" data-item-id={entry.id} data-item-campaign={entry.campaign || ''} onClick={() => requestAppRoute({ view: 'catalog', itemId: entry.id })}>",
  },
  {
    from: "  const [statsOpen, setStatsOpen] = useState(false)\n",
    to: "  const [statsOpen, setStatsOpen] = useState(false)\n\n  useEffect(() => {\n    const current = materialTrail[materialTrail.length - 1]\n    document.dispatchEvent(new CustomEvent('masterwork:detail-state', { detail: { nested: materialTrail.length > 0, title: current?.name || item.name } }))\n  }, [materialTrail, item.name])\n\n  useEffect(() => {\n    const onBack = () => setMaterialTrail((trail) => trail.length ? trail.slice(0, -1) : trail)\n    document.addEventListener('masterwork:detail-back', onBack)\n    return () => document.removeEventListener('masterwork:detail-back', onBack)\n  }, [])\n",
  },
  {
    from: "  const item = filtered.find((candidate) => candidate.id === id) || filtered[0]\n",
    to: "  const item = filtered.find((candidate) => candidate.id === id) || filtered[0]\n\n  useEffect(() => {\n    const routeHasItem = window.location.pathname.split('/').filter(Boolean).length >= 3\n    document.dispatchEvent(new CustomEvent('masterwork:app-state', {\n      detail: { view, planCount: plan.size, itemId: item?.id || null, itemTitle: item?.name || null, detailOpen: view === 'catalog' && routeHasItem && Boolean(item) },\n    }))\n  }, [view, plan.size, item?.id, item?.name])\n",
  },
])

console.log('Next-level integration applied: mobile shell consumes explicit application events instead of interrogating desktop DOM.')
