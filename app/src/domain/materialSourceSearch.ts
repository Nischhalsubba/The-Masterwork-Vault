import type { MaterialSourceGuide } from '../data/materialSources'

/** Search normalization only. Never use this to merge distinct recipe identities. */
export function sourceSearchText(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase().replace(/[\u2018\u2019']/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim()
}

export function indexMaterialSource(guide: MaterialSourceGuide) {
  return {
    guide,
    text: sourceSearchText([
      guide.name, ...guide.aliases, guide.scope,
      ...guide.routes.flatMap((route) => [route.location, route.method, ...route.requirements]),
    ].join(' ')),
  }
}

export function matchesMaterialSource(text: string, query: string): boolean {
  return sourceSearchText(query).split(/\s+/).filter(Boolean).every((word) => text.includes(word))
}
