const names = [
  'Feywood Broad Slab',
  "Fey'd Leaf Sword Knot",
  'Feywood Sprouts',
  'Feywood Lute',
  'Feywood Rapier',
  'Silvervine Sceptor',
  'Frozen Dew Icon',
  'Feywood Carved Blade',
  'Feywood Buckler',
  'Feywood Club',
  'Feywood Shield',
  'Feywood Longbow',
  'Feywood Blades',
  'Feywood Stiletto',
  'Feywood Dagger',
  'Feywood Pact Blade',
  'Petrified Grimoire',
  'Silvervine Orb',
  'Thorned Talisman',
] as const

const sources = [
  'Barbarian/1.png',
  'Barbarian/2.png',
  'Barbarian/3.png',
  'Bard/1.png',
  'Bard/2.png',
  'cleric/1.png',
  'cleric/2.png',
  'Fighter/1.png',
  'Fighter/2.png',
  'Paladin/1.png',
  'Paladin/2.png',
  'Ranger/1.png',
  'Ranger/2.png',
  'Rogue/1.png',
  'Rogue/2.png',
  'Warlock/1.png',
  'Warlock/2.png',
  'Wizard/1.png',
  'Wizard/2.png',
] as const

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ')

const slug = (value: string) => normalize(value).replace(/ /g, '-')
const indexByName = new Map<string, number>(names.map((name, index) => [normalize(name), index]))
const sourceByName = new Map<string, string>(names.map((name, index) => [normalize(name), sources[index]]))
const atlasUrl = `${import.meta.env.BASE_URL}sharandar-verified-weapons.svg`

export const verifiedSharandarWeaponNames = [...names]

export const verifiedSharandarWeaponIconIndex = (name: string) => indexByName.get(normalize(name)) ?? null

export const verifiedSharandarWeaponIconSource = (name: string) => sourceByName.get(normalize(name)) ?? null

export const verifiedSharandarWeaponIconDataUri = (name: string) => {
  const index = verifiedSharandarWeaponIconIndex(name)
  if (index == null) return null
  return `${atlasUrl}#${slug(names[index])}`
}
