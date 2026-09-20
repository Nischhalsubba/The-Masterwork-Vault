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

const tailoringSource = 'https://neverwinter.fandom.com/ru/wiki/%D0%9A%D1%80%D0%BE%D0%B9%D0%BA%D0%B0_%D0%B8_%D1%88%D0%B8%D1%82%D1%8C%D0%B5'
const leatherworkingSource = 'https://neverwinter.fandom.com/ru/wiki/%D0%9E%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0_%D0%BA%D0%BE%D0%B6%D0%B8'

// Exact game asset names exposed by the maintained Neverwinter profession tables.
// The app serves them through its own /media/neverwinter proxy so catalog rendering
// does not depend on direct third-party image hotlinks.
export const verifiedSharandarRemoteIcons = {
  'Twig Crown': {
    assetFile: 'Icons Inventory Masterwork Head Warlock Fey Druidic M 01.png',
    sourceUrl: leatherworkingSource,
  },
  'Feywood Sash +1': {
    assetFile: 'Inventory Waist Stronghold Crafted Physical Feywood.png',
    sourceUrl: tailoringSource,
  },
  'Thorned Sash +1': {
    assetFile: 'Inventory Waist Stronghold Crafted Healer Thorned.png',
    sourceUrl: tailoringSource,
  },
  "Dawn's Light Sash +1": {
    assetFile: 'Inventory Waist Stronghold Crafted Tank Silvervine.png',
    sourceUrl: tailoringSource,
  },
  'Thorned Amulet +1': {
    assetFile: 'Inventory_Neck_Stronghold_Crafted_Healer_Thorned.png',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%A8%D0%B8%D0%BF%D0%B0%D1%81%D1%82%D1%8B%D0%B9_%D0%B0%D0%BC%D1%83%D0%BB%D0%B5%D1%82',
  },
  'Feywood Amulet +1': {
    assetFile: 'Inventory_Neck_Stronghold_Crafted_Physical_Feywood.png',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%90%D0%BC%D1%83%D0%BB%D0%B5%D1%82_%D0%B8%D0%B7_%D0%B4%D0%B5%D1%80%D0%B5%D0%B2%D0%B0_%D1%84%D1%8D%D0%B9%D1%80%D0%B8',
  },
  'Crafted Potion of Accuracy Rank 13': {
    assetFile: 'Inventory_Consumables_Potion_T13_Alchemical_Blue.png',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%A1%D0%B4%D0%B5%D0%BB%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B7%D0%B5%D0%BB%D1%8C%D0%B5_%D1%82%D0%BE%D1%87%D0%BD%D0%BE%D1%81%D1%82%D0%B8_13_%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D1%8F',
  },
  'Crafted Potion of Critical Strike Rank 13': {
    assetFile: 'Inventory_Consumables_Potion_T13_Alchemical_Electric.png',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%A1%D0%B4%D0%B5%D0%BB%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B7%D0%B5%D0%BB%D1%8C%D0%B5_%D0%BA%D1%80%D0%B8%D1%82%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D1%83%D0%B4%D0%B0%D1%80%D0%B0_13_%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D1%8F',
  },
  'Crafted Potion of Defense Rank 13': {
    assetFile: 'Inventory_Consumables_Potion_T13_Alchemical_Water.png',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%A1%D0%B4%D0%B5%D0%BB%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B7%D0%B5%D0%BB%D1%8C%D0%B5_%D0%BE%D0%B1%D0%BE%D1%80%D0%BE%D0%BD%D1%8B_13_%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D1%8F',
  },
  'Crafted Potion of Deflect Rank 13': {
    assetFile: 'Inventory_Consumables_Potion_T13_Alchemical_Green.png',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%A1%D0%B4%D0%B5%D0%BB%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B7%D0%B5%D0%BB%D1%8C%D0%B5_%D0%BF%D0%B0%D1%80%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_13_%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D1%8F',
  },
  'Crafted Potion of Power Rank 13': {
    assetFile: 'Inventory_Consumables_Potion_T13_Alchemical_Yellowgreen.png',
    sourceUrl: 'https://neverwinter.fandom.com/ru/wiki/%D0%A1%D0%B4%D0%B5%D0%BB%D0%B0%D0%BD%D0%BD%D0%BE%D0%B5_%D0%B7%D0%B5%D0%BB%D1%8C%D0%B5_%D0%B4%D0%B5%D0%B9%D1%81%D1%82%D0%B2%D0%B8%D1%8F_13_%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D1%8F',
  },
} as const

const remoteIconByName = new Map<string, (typeof verifiedSharandarRemoteIcons)[keyof typeof verifiedSharandarRemoteIcons]>(
  Object.entries(verifiedSharandarRemoteIcons).map(([name, row]) => [normalize(name), row]),
)

export const verifiedSharandarRemoteIconEvidence = (name: string) => remoteIconByName.get(normalize(name)) ?? null

const neverwinterMediaUrl = (assetFile: string) => `https://neverwinter.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(assetFile)}`

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

  const remoteIcon = verifiedSharandarRemoteIconEvidence(name)
  if (remoteIcon) return neverwinterMediaUrl(remoteIcon.assetFile)

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
