export type ReferenceIconKind =
  | 'amulet'
  | 'sash'
  | 'material'
  | 'tool'
  | 'supplement'
  | 'armor'
  | 'weapon'
  | 'item'

const palette = {
  background: '#111923',
  surface: '#1B2733',
  line: '#93A6B8',
  accent: '#D7B56D',
  muted: '#627487',
}

const frame = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <rect width="64" height="64" rx="12" fill="${palette.background}"/>
  <rect x="3" y="3" width="58" height="58" rx="10" fill="${palette.surface}" stroke="${palette.muted}" stroke-width="2"/>
  ${body}
</svg>`

const glyphs: Record<ReferenceIconKind, string> = {
  amulet: `<path d="M19 12c1 10 5 15 13 20 8-5 12-10 13-20" fill="none" stroke="${palette.line}" stroke-width="3" stroke-linecap="round"/><path d="M32 28l10 10-10 14-10-14 10-10z" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="38" r="3" fill="${palette.accent}"/>`,
  sash: `<path d="M12 23c14 3 26 3 40 0v12c-14 3-26 3-40 0V23z" fill="none" stroke="${palette.line}" stroke-width="3"/><rect x="25" y="24" width="14" height="12" rx="2" fill="none" stroke="${palette.accent}" stroke-width="3"/><path d="M28 39l-4 13M36 39l4 13" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round"/>`,
  material: `<path d="M32 10l17 10v20L32 54 15 40V20L32 10z" fill="none" stroke="${palette.line}" stroke-width="3"/><path d="M24 34l8-15 8 15-8 9-8-9z" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-linejoin="round"/>`,
  tool: `<path d="M18 16l13 13M27 13l8 8-6 6-8-8 6-6zM30 30l5-5 17 17-5 5-17-17z" fill="none" stroke="${palette.line}" stroke-width="3" stroke-linejoin="round"/><path d="M15 49l18-18" stroke="${palette.accent}" stroke-width="4" stroke-linecap="round"/>`,
  supplement: `<path d="M25 12h14M28 12v12l-9 18c-3 6 1 10 7 10h12c6 0 10-4 7-10l-9-18V12" fill="none" stroke="${palette.line}" stroke-width="3" stroke-linejoin="round"/><path d="M23 39h18" stroke="${palette.accent}" stroke-width="3"/><circle cx="29" cy="44" r="2" fill="${palette.accent}"/><circle cx="36" cy="47" r="2" fill="${palette.accent}"/>`,
  armor: `<path d="M21 15l11-5 11 5 8 9-7 8v20H20V32l-7-8 8-9z" fill="none" stroke="${palette.line}" stroke-width="3" stroke-linejoin="round"/><path d="M32 12v40M23 33h18" stroke="${palette.accent}" stroke-width="3"/>`,
  weapon: `<path d="M17 49L45 21M38 14l12 12M14 44l6 6M40 18l6 6" stroke="${palette.line}" stroke-width="4" stroke-linecap="round"/><circle cx="18" cy="48" r="4" fill="none" stroke="${palette.accent}" stroke-width="3"/>`,
  item: `<path d="M32 10l7 14 15 2-11 11 3 15-14-7-14 7 3-15L10 26l15-2 7-14z" fill="none" stroke="${palette.line}" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="32" r="6" fill="none" stroke="${palette.accent}" stroke-width="3"/>`,
}

export function referenceIconDataUri(kind: ReferenceIconKind = 'item') {
  return `data:image/svg+xml,${encodeURIComponent(frame(glyphs[kind]))}`
}

export function referenceIconKindForEntity(kind?: string | null, slot?: string | null): ReferenceIconKind {
  const normalizedKind = String(kind ?? '').toLowerCase()
  const normalizedSlot = String(slot ?? '').toLowerCase()
  if (normalizedSlot === 'neck' || normalizedKind.includes('amulet')) return 'amulet'
  if (normalizedSlot === 'waist' || normalizedKind.includes('belt') || normalizedKind.includes('sash')) return 'sash'
  if (normalizedKind.includes('material')) return 'material'
  if (normalizedKind.includes('tool')) return 'tool'
  if (normalizedKind.includes('supplement') || normalizedKind.includes('consumable')) return 'supplement'
  if (normalizedKind.includes('armor')) return 'armor'
  if (normalizedKind.includes('weapon')) return 'weapon'
  return 'item'
}
