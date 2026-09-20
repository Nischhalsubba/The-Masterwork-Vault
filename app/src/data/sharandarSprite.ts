import c0 from './sharandarSpriteChunk0'
import c1 from './sharandarSpriteChunk1'
import c2 from './sharandarSpriteChunk2'
import c3 from './sharandarSpriteChunk3'
import c4 from './sharandarSpriteChunk4'
import gatheringMaterialIconOverrides from './gatheringMaterialIconOverrides'
import {
  verifiedSharandarWeaponIconDataUri,
  verifiedSharandarWeaponIconIndex,
} from './sharandarVerifiedWeaponIcons'

const names = [
  'Silver Vines', 'Silvertongue Moss', "Shard of Dawn's Light", 'Feywood Lumber', 'Feywood Log', 'Soulfire Flies', 'Hardened Feywood', "Ears 'n Tears",
  'Living Feywood', "Weeping Willow's Tears", "Dawn's Silver Enamel", 'Salty Tears Varnish', 'Lacquered Leaves', 'Questionable Piece of Leather', 'Dryad Hair', "Lacquered 'Aged' Leather",
  "Shadowdemon's Eyes", "Fey'd Fabrics", 'Woven Fey Leaves', 'Fey Fibers', 'Woven Whiskers', "Displacer Beast's Whisker", 'Beads of Light', 'Crystalline Ornament',
  'Thorned Ornament', 'Corpse Flower Thorn', "Frozen Dawn's Dew", 'Shattered Snowflakes', 'Feywood Broad Slab', "Fey'd Leaf Sword Knot", 'Feywood Sprouts', 'Feywood Lute',
  'Feywood Rapier', 'Silvervine Sceptor', 'Frozen Dew Icon', 'Feywood Carved Blade', 'Feywood Buckler', 'Feywood Club', 'Feywood Shield', 'Feywood Longbow',
  'Feywood Blades', 'Feywood Stiletto', 'Feywood Dagger', 'Feywood Pact Blade', 'Petrified Grimoire', 'Silvervine Orb', 'Thorned Talisman', 'Lacquered Leaf Waders',
  'Petrified Braces', 'Petrified Wraps', 'Petrified Wristlets', "Fey'd Leaf Branches", 'Feywood Bark', 'Petrified Bark Barbute', 'Feywood Bark Barbute', 'Sprouting Crown',
  "Fey'd Leaf Wood Crown", "Hermit's Medicinal Tea", 'Hardened Blight Bark', 'Shade Leaves', 'Honey', "Hermit's Incense", "Troll's Earwax Resin", 'Alkali',
] as const

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/\+1/g, '')
  .replace(/[’']/g, '')
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ')

const materialKey = (value: string) => normalize(value).replace(/ /g, '-')

// Some Sharandar outputs intentionally share the exact same Neverwinter inventory asset.
// These aliases are evidence-backed by the maintained Neverwinter Wiki inventory tables;
// they let us reuse an already-extracted local game icon instead of falling back to generic UI art.
export const verifiedSharandarIconAliases = {
  "Fey'd Leaf Wood Wraps": {
    canonical: "Fey'd Leaf Branches",
    assetFile: 'Icons Inventory Masterwork Arms Control Fey Druidic M 01',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%9A%D1%80%D0%BE%D0%B9%D0%BA%D0%B0_%D0%B8_%D1%88%D0%B8%D1%82%D1%8C%D0%B5',
  },
  "Fey'd Leaf Branch Crown": {
    canonical: "Fey'd Leaf Wood Crown",
    assetFile: 'Icons Inventory Masterwork Head Control Fey Druidic M 01',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%9A%D1%80%D0%BE%D0%B9%D0%BA%D0%B0_%D0%B8_%D1%88%D0%B8%D1%82%D1%8C%D0%B5',
  },
  'Petrified Armlets': {
    canonical: 'Petrified Braces',
    assetFile: 'Icons Inventory Masterwork Arms Bard Fey Druidic M 01',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%9E%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0_%D0%BA%D0%BE%D0%B6%D0%B8',
  },
  'Petrified Guards': {
    canonical: 'Petrified Braces',
    assetFile: 'Icons Inventory Masterwork Arms Bard Fey Druidic M 01',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%9E%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0_%D0%BA%D0%BE%D0%B6%D0%B8',
  },
  'Petrified Wristguards': {
    canonical: 'Petrified Braces',
    assetFile: 'Icons Inventory Masterwork Arms Bard Fey Druidic M 01',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%9E%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0_%D0%BA%D0%BE%D0%B6%D0%B8',
  },
  'Petrified Barbute': {
    canonical: 'Petrified Bark Barbute',
    assetFile: 'Icons Inventory Masterwork Head Trickster Fey Druidic M 01',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%9E%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0_%D0%BA%D0%BE%D0%B6%D0%B8',
  },
} as const

const iconAliasByName = new Map<string, string>(
  Object.entries(verifiedSharandarIconAliases).map(([name, row]) => [normalize(name), row.canonical]),
)

const resolveSharandarIconName = (name: string) => iconAliasByName.get(normalize(name)) ?? name

const indexByName = new Map<string, number>(names.map((name, index) => [normalize(name), index]))
const dataUri = `data:image/webp;base64,${c0}${c1}${c2}${c3}${c4}`

export const sharandarSprite = {
  dataUri,
  tileSize: 40,
  columns: 8,
  count: names.length,
} as const

// The original contact-sheet extraction mislabeled several final weapon icons with ingredient
// crops. Verified weapon art is now resolved from its own screenshot-backed atlas. Returning null
// here for those names also prevents a failed direct image from silently falling back to the old,
// incorrect tile.
export const sharandarIconIndex = (name: string) => {
  if (verifiedSharandarWeaponIconIndex(name) != null) return null
  return indexByName.get(normalize(resolveSharandarIconName(name))) ?? null
}

export const sharandarIconDataUri = (name: string) => {
  const materialOverride = gatheringMaterialIconOverrides[materialKey(name)]
  if (materialOverride) return materialOverride

  const verifiedWeapon = verifiedSharandarWeaponIconDataUri(name)
  if (verifiedWeapon) return verifiedWeapon

  const index = sharandarIconIndex(name)
  if (index == null) return null
  const col = index % sharandarSprite.columns
  const row = Math.floor(index / sharandarSprite.columns)
  const rows = Math.ceil(sharandarSprite.count / sharandarSprite.columns)
  const tile = sharandarSprite.tileSize
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}" viewBox="0 0 ${tile} ${tile}"><image href="${dataUri}" width="${sharandarSprite.columns * tile}" height="${rows * tile}" x="${-col * tile}" y="${-row * tile}"/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
