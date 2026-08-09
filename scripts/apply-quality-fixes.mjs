import { readFile, writeFile } from 'node:fs/promises'

async function patch(path, edits) {
  let source = await readFile(path, 'utf8')
  for (const { from, to, optional = false } of edits) {
    if (source.includes(to)) continue
    if (!source.includes(from)) {
      if (optional) continue
      throw new Error(`Quality patch target not found in ${path}: ${from.slice(0, 90)}`)
    }
    source = source.replace(from, to)
  }
  await writeFile(path, source)
}

await patch('src/App.tsx', [
  {
    from: "import { useEffect, useMemo, useRef, useState } from 'react'",
    to: "import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'",
  },
  {
    from: "const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`",
    to: `const asset = (p: string) => \`${'${import.meta.env.BASE_URL}'}${'${p}'}\`\nconst MAX_PLAN_QUANTITY = 999\n\ntype AppRouteDetail = { view: 'catalog' | 'plan' | 'materials' | 'reference'; itemId?: string; campaign?: CampaignFilter }`,
  },
  {
    from: "  useEffect(() => {\n    const encoded = new URLSearchParams(window.location.search).get('plan')\n    if (!encoded) return\n    try {\n      const rows = JSON.parse(encoded) as Array<[string, number]>\n      if (!Array.isArray(rows)) return\n      const next = new Map<string, number>()\n      for (const row of rows) {\n        if (!Array.isArray(row) || row.length !== 2) continue\n        const [itemId, quantity] = row\n        if (typeof itemId !== 'string' || !Number.isInteger(quantity) || quantity <= 0) continue\n        const candidate = catalog.items.find((item) => item.id === itemId)\n        if (!candidate || candidate.recipeKnown === false || !candidate.materials.length) continue\n        next.set(itemId, Math.min(quantity, 999))\n      }\n      if (next.size > 0) {\n        setPlan(next)\n        setView('plan')\n      }\n    } catch {\n      // Ignore malformed shared-plan payloads and keep the normal app state.\n    }\n  }, [])",
    to: `  useEffect(() => {\n    const applyLocation = (route?: AppRouteDetail) => {\n      if (route) {\n        setView(route.view)\n        if (route.itemId) {\n          const target = catalog.items.find((entry) => entry.id === route.itemId)\n          if (target) {\n            setId(target.id)\n            setCampaign((target.campaign as CampaignFilter) || 'All')\n          }\n        }\n      }\n\n      const params = new URLSearchParams(window.location.search)\n      const campaignParam = params.get('campaign')\n      if (campaignParam === 'Sharandar' || campaignParam === 'Underdark' || campaignParam === 'All') setCampaign(campaignParam)\n      setCls(params.get('class') || 'All')\n      setKind(params.get('kind') || 'All')\n      setQ(params.get('q') || '')\n\n      const encoded = params.get('plan')\n      if (!encoded) return\n      try {\n        const rows = JSON.parse(encoded) as Array<[string, number]>\n        if (!Array.isArray(rows)) return\n        const next = new Map<string, number>()\n        for (const row of rows) {\n          if (!Array.isArray(row) || row.length !== 2) continue\n          const [itemId, quantity] = row\n          if (typeof itemId !== 'string' || !Number.isInteger(quantity) || quantity <= 0) continue\n          const candidate = catalog.items.find((item) => item.id === itemId)\n          if (!candidate || candidate.recipeKnown === false || !candidate.materials.length) continue\n          next.set(itemId, Math.min(quantity, MAX_PLAN_QUANTITY))\n        }\n        if (next.size > 0) {\n          setPlan(next)\n          setView('plan')\n        }\n      } catch {\n        // Malformed shared links fail closed instead of corrupting planner state.\n      }\n    }\n\n    const onRoute = (event: Event) => applyLocation((event as CustomEvent<AppRouteDetail>).detail)\n    document.addEventListener('masterwork:navigate', onRoute)\n    applyLocation()\n    return () => document.removeEventListener('masterwork:navigate', onRoute)\n  }, [])`,
  },
  {
    from: "  const filtered = useMemo(() => collectionItems.filter((item) => {\n    const classMatch = cls === 'All' || item.classes.includes(cls)\n    const kindMatch = kind === 'All' || item.kind === kind\n    const queryMatch = [item.name, item.slot, item.profession, item.campaign, ...item.classes, ...item.categories, ...item.materials.map((m) => m.name)].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())\n    return classMatch && kindMatch && queryMatch\n  }), [collectionItems, cls, kind, q])\n\n  const item = filtered.find((candidate) => candidate.id === id) || filtered[0] || collectionItems[0] || catalog.items[0]",
    to: `  const deferredQ = useDeferredValue(q)\n  const filtered = useMemo(() => {\n    const query = norm(deferredQ)\n    return collectionItems\n      .filter((item) => {\n        const classMatch = cls === 'All' || item.classes.includes(cls)\n        const kindMatch = kind === 'All' || item.kind === kind\n        const haystack = norm([item.name, item.slot, item.profession, item.campaign, ...item.classes, ...item.categories, ...item.materials.map((m) => m.name)].filter(Boolean).join(' '))\n        return classMatch && kindMatch && (!query || haystack.includes(query))\n      })\n      .sort((a, b) => {\n        if (!query) return a.name.localeCompare(b.name)\n        const an = norm(a.name); const bn = norm(b.name)\n        const ar = an === query ? 0 : an.startsWith(query) ? 1 : an.includes(query) ? 2 : 3\n        const br = bn === query ? 0 : bn.startsWith(query) ? 1 : bn.includes(query) ? 2 : 3\n        return ar - br || a.name.localeCompare(b.name)\n      })\n  }, [collectionItems, cls, kind, deferredQ])\n\n  const item = filtered.find((candidate) => candidate.id === id) || filtered[0]`,
  },
  {
    from: "  const resultContext = `${campaign === 'All' ? 'All collections' : campaign} · ${cls === 'All' ? 'all classes' : cls} · ${kind === 'All' ? 'all craftables' : kind}`",
    to: `  const resultContext = \`${'${campaign === \'All\' ? \'All collections\' : campaign}'} · ${'${cls === \'All\' ? \'all classes\' : cls}'} · ${'${kind === \'All\' ? \'all craftables\' : kind}'}\`\n  const resetCatalogFilters = () => { setCls('All'); setKind('All'); setQ('') }\n\n  useEffect(() => {\n    if (view !== 'catalog') return\n    const url = new URL(window.location.href)\n    const setOrDelete = (key: string, value: string, empty: string) => value === empty ? url.searchParams.delete(key) : url.searchParams.set(key, value)\n    setOrDelete('campaign', campaign, 'Sharandar')\n    setOrDelete('class', cls, 'All')\n    setOrDelete('kind', kind, 'All')\n    setOrDelete('q', q.trim(), '')\n    window.history.replaceState(window.history.state, '', url)\n  }, [view, campaign, cls, kind, q])`,
  },
  {
    from: "<nav>{([['catalog', BookOpen, 'Catalog'], ['plan', Boxes, 'Plan'], ['materials', Gem, 'Materials'], ['reference', CircleHelp, 'Reference']] as const).map(([v, I, l]) => <button className={view === v ? 'active' : ''} onClick={() => setView(v)} key={v}>",
    to: "<nav>{([['catalog', BookOpen, 'Catalog'], ['plan', Boxes, 'Plan'], ['materials', Gem, 'Materials'], ['reference', CircleHelp, 'Reference']] as const).map(([v, I, l]) => <button data-view={v} className={view === v ? 'active' : ''} onClick={() => setView(v)} key={v}>",
  },
  {
    from: "return <article className={entry.id === item.id ? 'selected' : ''} key={entry.id}>\n                      <button className=\"item-main\" onClick={() => setId(entry.id)}>",
    to: "return <article className={entry.id === item?.id ? 'selected' : ''} key={entry.id}>\n                      <button className=\"item-main\" data-item-id={entry.id} data-item-campaign={entry.campaign || ''} onClick={() => setId(entry.id)}>",
  },
  {
    from: "                  {filtered.map((entry) => {",
    to: "                  {filtered.length === 0 && <div className=\"catalog-empty-state\" role=\"status\"><Search size={28} aria-hidden=\"true\" /><h3>No craftables match</h3><p>Try a broader search or clear the active filters.</p><button className=\"ghost\" onClick={resetCatalogFilters}>Clear search and filters</button></div>}\n                  {filtered.map((entry) => {",
  },
  {
    from: "                <Detail item={item} inPlan={plan.has(item.id)} togglePlan={() => toggle(item)} />",
    to: "                {item ? <Detail item={item} inPlan={plan.has(item.id)} togglePlan={() => toggle(item)} /> : <section className=\"detail panel catalog-empty-detail\" aria-hidden=\"true\" />} ",
  },
  {
    from: "        <div className=\"reference-tabs\" role=\"tablist\" aria-label=\"Workshop reference sections\">\n          <button className={tab === 'workshop' ? 'active' : ''} onClick={() => setTab('workshop')}>Workshop</button>\n          <button className={tab === 'artisans' ? 'active' : ''} onClick={() => setTab('artisans')}>Artisans</button>\n          <button className={tab === 'south-seas' ? 'active' : ''} onClick={() => setTab('south-seas')}>South Seas</button>\n          <button className={tab === 'sources' ? 'active' : ''} onClick={() => setTab('sources')}>Sources</button>\n        </div>",
    to: "        <div className=\"reference-tabs\" role=\"tablist\" aria-label=\"Workshop reference sections\">\n          <button role=\"tab\" aria-selected={tab === 'workshop'} className={tab === 'workshop' ? 'active' : ''} onClick={() => setTab('workshop')}>Workshop</button>\n          <button role=\"tab\" aria-selected={tab === 'artisans'} className={tab === 'artisans' ? 'active' : ''} onClick={() => setTab('artisans')}>Artisans</button>\n          <button role=\"tab\" aria-selected={tab === 'south-seas'} className={tab === 'south-seas' ? 'active' : ''} onClick={() => setTab('south-seas')}>South Seas</button>\n          <button role=\"tab\" aria-selected={tab === 'sources'} className={tab === 'sources' ? 'active' : ''} onClick={() => setTab('sources')}>Sources</button>\n        </div>",
  },
])

await patch('src/components/CraftingWorkbench.tsx', [
  {
    from: "  const readiness = useMemo(() => catalog.items.map((item) => {",
    to: "  const readiness = useMemo(() => catalog.items.filter((item) => item.recipeKnown !== false && item.materials.length > 0).map((item) => {",
  },
  {
    from: "    else next.set(id, quantity)",
    to: "    else next.set(id, Math.min(999, Math.max(1, Math.floor(quantity))))",
  },
  {
    from: "  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => loadJson(SAVED_PLANS_KEY, []))",
    to: "  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>(() => { const value = loadJson<unknown>(SAVED_PLANS_KEY, []); return Array.isArray(value) ? value.filter((row): row is SavedPlan => Boolean(row && typeof row === 'object' && typeof (row as SavedPlan).id === 'string' && typeof (row as SavedPlan).name === 'string' && Array.isArray((row as SavedPlan).items))) : [] })",
  },
  {
    from: "        <button className=\"ghost\" onClick={() => setInventory({})}>Clear inventory</button>",
    to: "        <button className=\"ghost\" onClick={() => { if (Object.keys(inventory).length && !window.confirm('Clear all saved inventory quantities?')) return; setInventory({}) }}>Clear inventory</button>",
  },
  {
    from: "<button className=\"danger-ghost\" aria-label={`Delete ${plan.name}`} onClick={() => setSavedPlans((plans) => plans.filter((row) => row.id !== plan.id))}",
    to: "<button className=\"danger-ghost\" aria-label={`Delete ${plan.name}`} onClick={() => { if (window.confirm(`Delete saved plan “${plan.name}”?`)) setSavedPlans((plans) => plans.filter((row) => row.id !== plan.id)) }}",
  },
  {
    from: "{shareStatus && <small>{shareStatus}</small>}",
    to: "{shareStatus && <small role=\"status\" aria-live=\"polite\">{shareStatus}</small>}",
  },
  {
    from: "<button aria-label=\"Copy shareable plan URL\" onClick={() => navigator.clipboard.writeText(shareUrl)}><Copy size={15} /></button>",
    to: "<button aria-label=\"Copy shareable plan URL\" onClick={async () => { try { await navigator.clipboard.writeText(shareUrl); setShareStatus('Share link copied') } catch { setShareStatus('Copy failed — select the link and copy it manually') } }}><Copy size={15} /></button>",
  },
])

await patch('src/components/WorkshopJourney.tsx', [
  {
    from: "import { useEffect, useMemo, useState } from 'react'",
    to: "import { useEffect, useMemo, useRef, useState } from 'react'",
  },
  {
    from: "  const [commissionName, setCommissionName] = useState('Beeswax')",
    to: "  const [commissionName, setCommissionName] = useState('Beeswax')\n  const dialogRef = useRef<HTMLElement>(null)\n  const returnFocusRef = useRef<HTMLElement | null>(null)",
  },
  {
    from: "  useEffect(() => {\n    if (!open) return\n    const closeOnEscape = (event: KeyboardEvent) => {\n      if (event.key === 'Escape') {\n        clearGuideHash()\n        setOpen(false)\n      }\n    }\n    window.addEventListener('keydown', closeOnEscape)\n    return () => window.removeEventListener('keydown', closeOnEscape)\n  }, [open])",
    to: `  useEffect(() => {\n    if (!open) return\n    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null\n    const previousOverflow = document.body.style.overflow\n    document.body.style.overflow = 'hidden'\n    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('button, a, input, select, [tabindex]:not([tabindex="-1"])')?.focus())\n    const onKeyDown = (event: KeyboardEvent) => {\n      if (event.key === 'Escape') { clearGuideHash(); setOpen(false); return }\n      if (event.key !== 'Tab' || !dialogRef.current) return\n      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((el) => el.getClientRects().length > 0)\n      if (!focusables.length) return\n      const first = focusables[0]; const last = focusables[focusables.length - 1]\n      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }\n      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }\n    }\n    window.addEventListener('keydown', onKeyDown)\n    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; returnFocusRef.current?.focus({ preventScroll: true }) }\n  }, [open])`,
  },
  {
    from: "          <section className=\"workshop-journey-sheet\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"workshop-journey-title\">",
    to: "          <section ref={dialogRef} className=\"workshop-journey-sheet\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"workshop-journey-title\">",
  },
])

console.log('Quality patches applied successfully.')
