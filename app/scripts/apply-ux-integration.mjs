import { readFile, writeFile } from 'node:fs/promises'

const path = 'src/App.tsx'
const source = await readFile(path, 'utf8')
const from = `  const [view, setView] = useState<'catalog' | 'plan' | 'materials' | 'reference'>('catalog')
  const [campaign, setCampaign] = useState<CampaignFilter>('Sharandar')
  const [cls, setCls] = useState('All')
  const [kind, setKind] = useState('All')
  const [q, setQ] = useState('')`
const to = `  const [view, setView] = useState<'catalog' | 'plan' | 'materials' | 'reference'>('catalog')
  const initialCatalogParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const initialCampaign = initialCatalogParams.get('campaign')
  const [campaign, setCampaign] = useState<CampaignFilter>(initialCampaign === 'Sharandar' || initialCampaign === 'Underdark' || initialCampaign === 'All' ? initialCampaign : 'Sharandar')
  const [cls, setCls] = useState(initialCatalogParams.get('class') || 'All')
  const [kind, setKind] = useState(initialCatalogParams.get('kind') || 'All')
  const [q, setQ] = useState(initialCatalogParams.get('q') || '')`

if (!source.includes(to)) {
  if (!source.includes(from)) throw new Error('UX integration target not found in src/App.tsx')
  await writeFile(path, source.replace(from, to))
}
