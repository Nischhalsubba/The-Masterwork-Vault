export type SharandarNeed = { name: string; required: number }

export type SharandarRecipe = {
  name: string
  outputQuantity: number
  quantityExplicit: boolean
  profession?: string | null
  materials: SharandarNeed[]
  evidence: string[]
}

const e = (path: string) => [`Sharandar.zip · ${path}`]

export const sharandarRecipes: SharandarRecipe[] = [
  { name: 'Silver Vines', outputQuantity: 3, quantityExplicit: true, materials: [{ name: 'Silvertongue Moss', required: 12 }, { name: "Shard of Dawn's Light", required: 1 }], evidence: e('Recipes General/1.png') },
  { name: 'Feywood Lumber', outputQuantity: 4, quantityExplicit: true, materials: [{ name: 'Feywood Log', required: 12 }, { name: 'Soulfire Flies', required: 1 }], evidence: e('Recipes General/2.png') },
  { name: 'Hardened Feywood', outputQuantity: 2, quantityExplicit: true, materials: [{ name: 'Feywood Lumber', required: 4 }, { name: "Ears 'n Tears", required: 1 }], evidence: e('Recipes General/3.png') },
  { name: 'Living Feywood', outputQuantity: 3, quantityExplicit: true, materials: [{ name: 'Feywood Lumber', required: 4 }, { name: "Weeping Willow's Tears", required: 1 }], evidence: e('Recipes General/4.png') },
  { name: "Dawn's Silver Enamel", outputQuantity: 3, quantityExplicit: true, materials: [{ name: "Shard of Dawn's Light", required: 1 }, { name: 'Silvertongue Moss', required: 4 }], evidence: e('Recipes General/5.png') },
  { name: "Ears 'n Tears", outputQuantity: 3, quantityExplicit: true, materials: [{ name: "Weeping Willow's Tears", required: 15 }, { name: 'Terebinth', required: 5 }], evidence: e('Recipes General/6.png') },
  { name: 'Salty Tears Varnish', outputQuantity: 3, quantityExplicit: true, materials: [{ name: "Weeping Willow's Tears", required: 3 }, { name: "Ears 'n Tears", required: 3 }], evidence: e('Recipes General/7.png') },
  { name: 'Lacquered Leaves', outputQuantity: 2, quantityExplicit: true, materials: [{ name: 'Questionable Piece of Leather', required: 12 }, { name: "Ears 'n Tears", required: 1 }, { name: 'Soulfire Flies', required: 1 }, { name: 'Dryad Hair', required: 6 }], evidence: e('Recipes General/8.png') },
  { name: "Lacquered 'Aged' Leather", outputQuantity: 2, quantityExplicit: true, materials: [{ name: "Shadowdemon's Eyes", required: 12 }, { name: 'Soulfire Flies', required: 1 }, { name: "Ears 'n Tears", required: 2 }, { name: 'Questionable Piece of Leather', required: 8 }], evidence: e('Recipes General/9.png') },
  { name: "Fey'd Fabrics", outputQuantity: 3, quantityExplicit: true, materials: [{ name: 'Dryad Hair', required: 12 }, { name: "Weeping Willow's Tears", required: 6 }], evidence: e('Recipes General/10.png') },
  { name: 'Woven Fey Leaves', outputQuantity: 2, quantityExplicit: true, materials: [{ name: 'Fey Fibers', required: 4 }, { name: 'Soulfire Flies', required: 1 }, { name: 'Dryad Hair', required: 4 }], evidence: e('Recipes General/11.png') },
  { name: 'Woven Whiskers', outputQuantity: 2, quantityExplicit: true, materials: [{ name: "Displacer Beast's Whisker", required: 15 }], evidence: e('Recipes General/12.png') },
  { name: 'Beads of Light', outputQuantity: 4, quantityExplicit: true, materials: [{ name: 'Silvertongue Moss', required: 12 }, { name: 'Silver Vines', required: 4 }, { name: "Shard of Dawn's Light", required: 1 }], evidence: e('Recipes General/13.png') },
  { name: 'Crystalline Ornament', outputQuantity: 2, quantityExplicit: true, materials: [{ name: 'Beads of Light', required: 4 }, { name: 'Woven Whiskers', required: 3 }, { name: "Shard of Dawn's Light", required: 12 }], evidence: e('Recipes General/14.png') },
  { name: 'Thorned Ornament', outputQuantity: 2, quantityExplicit: true, materials: [{ name: 'Beads of Light', required: 4 }, { name: 'Woven Whiskers', required: 3 }, { name: 'Corpse Flower Thorn', required: 6 }], evidence: e('Recipes General/15.png') },
  { name: 'Fey Fibers', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Dryad Hair', required: 12 }, { name: "Weeping Willow's Tears", required: 6 }], evidence: [...e('Recipes General/16.png'), 'Output quantity is not visible in the supplied crop; planner uses 1 until a source shows the yield.'] },
  { name: "Frozen Dawn's Dew", outputQuantity: 4, quantityExplicit: true, materials: [{ name: "Shard of Dawn's Light", required: 4 }, { name: 'Shattered Snowflakes', required: 1 }], evidence: e('Recipes General/unknown.png') },

  { name: 'Feywood Broad Slab', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Hardened Feywood', required: 4 }, { name: "Lacquered 'Aged' Leather", required: 2 }, { name: "Displacer Beast's Whisker", required: 3 }, { name: "Dawn's Silver Enamel", required: 4 }], evidence: e('Barbarian/1.png') },
  { name: "Fey'd Leaf Sword Knot", outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Beads of Light', required: 4 }, { name: 'Crystalline Ornament', required: 2 }, { name: 'Fey Fibers', required: 1 }], evidence: e('Barbarian/2.png') },
  { name: 'Feywood Sprouts', outputQuantity: 1, quantityExplicit: false, profession: 'Tailoring', materials: [{ name: 'Hardened Feywood', required: 2 }, { name: 'Crystalline Ornament', required: 2 }, { name: 'Fey Fibers', required: 3 }, { name: "Dawn's Silver Enamel", required: 1 }], evidence: e('Barbarian/3.png') },
  { name: 'Feywood Lute', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Hardened Feywood', required: 4 }, { name: 'Thorned Ornament', required: 2 }, { name: "Ears 'n Tears", required: 1 }], evidence: e('Bard/1.png') },
  { name: 'Feywood Rapier', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Silver Vines', required: 4 }, { name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Hardened Feywood', required: 1 }, { name: 'Crystalline Ornament', required: 1 }], evidence: e('Bard/2.png') },
  { name: 'Silvervine Sceptor', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Living Feywood', required: 3 }, { name: 'Woven Whiskers', required: 4 }, { name: 'Crystalline Ornament', required: 2 }, { name: 'Silver Vines', required: 1 }, { name: "Ears 'n Tears", required: 1 }], evidence: e('cleric/1.png') },
  { name: 'Frozen Dew Icon', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Hardened Feywood', required: 4 }, { name: 'Thorned Ornament', required: 2 }, { name: "Ears 'n Tears", required: 1 }], evidence: e('cleric/2.png') },
  { name: 'Feywood Carved Blade', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Hardened Feywood', required: 4 }, { name: "Lacquered 'Aged' Leather", required: 2 }, { name: "Displacer Beast's Whisker", required: 3 }, { name: 'Shattered Snowflakes', required: 1 }], evidence: e('Fighter/1.png') },
  { name: 'Feywood Buckler', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Living Feywood', required: 3 }, { name: 'Silver Vines', required: 4 }, { name: 'Crystalline Ornament', required: 2 }, { name: 'Lacquered Leaves', required: 1 }], evidence: e('Fighter/2.png') },
  { name: 'Feywood Club', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Hardened Feywood', required: 4 }, { name: "Lacquered 'Aged' Leather", required: 2 }, { name: "Ears 'n Tears", required: 3 }, { name: 'Woven Fey Leaves', required: 1 }], evidence: e('Paladin/1.png') },
  { name: 'Feywood Shield', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Living Feywood', required: 3 }, { name: 'Hardened Feywood', required: 4 }, { name: 'Lacquered Leaves', required: 2 }, { name: "Lacquered 'Aged' Leather", required: 1 }], evidence: e('Paladin/2.png') },
  { name: 'Feywood Longbow', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Living Feywood', required: 3 }, { name: 'Crystalline Ornament', required: 2 }, { name: 'Silver Vines', required: 2 }, { name: 'Fey Fibers', required: 2 }, { name: "Ears 'n Tears", required: 1 }], evidence: e('Ranger/1.png') },
  { name: 'Feywood Blades', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Hardened Feywood', required: 4 }, { name: 'Lacquered Leaves', required: 2 }, { name: 'Feywood Lumber', required: 1 }], evidence: e('Ranger/2.png') },
  { name: 'Feywood Stiletto', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Silver Vines', required: 4 }, { name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Hardened Feywood', required: 1 }, { name: 'Crystalline Ornament', required: 1 }], evidence: e('Rogue/1.png') },
  { name: 'Feywood Dagger', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Frozen Dawn's Dew", required: 3 }, { name: 'Hardened Feywood', required: 4 }, { name: 'Crystalline Ornament', required: 2 }, { name: "Displacer Beast's Whisker", required: 1 }], evidence: e('Rogue/2.png') },
  { name: 'Feywood Pact Blade', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Living Feywood', required: 3 }, { name: 'Silver Vines', required: 4 }, { name: 'Crystalline Ornament', required: 2 }, { name: 'Woven Whiskers', required: 1 }, { name: "Ears 'n Tears", required: 1 }], evidence: e('Warlock/1.png') },
  { name: 'Petrified Grimoire', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Salty Tears Varnish', required: 3 }, { name: "Lacquered 'Aged' Leather", required: 4 }, { name: 'Fey Fibers', required: 2 }, { name: 'Shade Leaves', required: 4 }], evidence: e('Warlock/2.png') },
  { name: 'Silvervine Orb', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Living Feywood', required: 3 }, { name: 'Woven Whiskers', required: 4 }, { name: 'Crystalline Ornament', required: 2 }, { name: 'Silver Vines', required: 1 }, { name: "Ears 'n Tears", required: 1 }], evidence: e('Wizard/1.png') },
  { name: 'Thorned Talisman', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Living Feywood', required: 3 }, { name: 'Beads of Light', required: 4 }, { name: 'Thorned Ornament', required: 2 }, { name: 'Fey Fibers', required: 1 }], evidence: e('Wizard/2.png') },

  { name: 'Lacquered Leaf Waders', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Woven Whiskers', required: 2 }, { name: 'Lacquered Leaves', required: 3 }, { name: 'Salty Tears Varnish', required: 1 }], evidence: e('Miscellaneous/1.png') },
  { name: 'Petrified Braces', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Thorned Ornament', required: 2 }, { name: 'Fey Fibers', required: 3 }, { name: 'Salty Tears Varnish', required: 1 }], evidence: e('Miscellaneous/2.png') },
  { name: 'Petrified Wraps', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Woven Whiskers', required: 2 }, { name: 'Lacquered Leaves', required: 3 }, { name: 'Salty Tears Varnish', required: 1 }], evidence: e('Miscellaneous/4.png') },
  { name: 'Petrified Wristlets', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Thorned Ornament', required: 2 }, { name: 'Fey Fibers', required: 3 }, { name: 'Salty Tears Varnish', required: 1 }], evidence: e('Miscellaneous/6.png') },
  { name: "Fey'd Leaf Branches", outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Crystalline Ornament', required: 2 }, { name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Fey Fibers', required: 3 }, { name: 'Salty Tears Varnish', required: 1 }], evidence: e('Miscellaneous/8.png') },
  { name: 'Feywood Bark', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Hardened Feywood', required: 2 }, { name: 'Crystalline Ornament', required: 2 }, { name: "Ears 'n Tears", required: 3 }, { name: "Dawn's Silver Enamel", required: 1 }], evidence: e('Miscellaneous/10.png') },
  { name: 'Petrified Bark Barbute', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Thorned Ornament', required: 2 }, { name: 'Fey Fibers', required: 3 }, { name: 'Salty Tears Varnish', required: 1 }], evidence: e('Miscellaneous/12.png') },
  { name: 'Feywood Bark Barbute', outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Hardened Feywood', required: 2 }, { name: 'Woven Fey Leaves', required: 2 }, { name: 'Beads of Light', required: 3 }, { name: "Dawn's Silver Enamel", required: 1 }], evidence: e('Miscellaneous/14.png') },
  { name: 'Sprouting Crown', outputQuantity: 1, quantityExplicit: false, materials: [{ name: "Lacquered 'Aged' Leather", required: 2 }, { name: 'Woven Whiskers', required: 2 }, { name: 'Fey Fibers', required: 3 }, { name: 'Salty Tears Varnish', required: 1 }], evidence: e('Miscellaneous/15.png') },
  { name: "Fey'd Leaf Wood Crown", outputQuantity: 1, quantityExplicit: false, materials: [{ name: 'Woven Whiskers', required: 2 }, { name: 'Thorned Ornament', required: 2 }, { name: 'Woven Fey Leaves', required: 3 }, { name: 'Salty Tears Varnish', required: 1 }], evidence: e('Miscellaneous/16.png') },

  { name: 'Crafted Potion of Accuracy Rank 13', outputQuantity: 1, quantityExplicit: false, profession: 'Alchemy', materials: [{ name: "Weeping Willow's Tears", required: 12 }, { name: "Shadowdemon's Eyes", required: 1 }, { name: 'Alkali', required: 1 }, { name: 'Sugar Beet', required: 12 }], evidence: e('Potions/1.png + Potions/2.png') },
  { name: 'Crafted Potion of Critical Strike Rank 13', outputQuantity: 1, quantityExplicit: false, profession: 'Alchemy', materials: [{ name: "Weeping Willow's Tears", required: 12 }, { name: "Shadowdemon's Eyes", required: 1 }, { name: 'Alkali', required: 1 }, { name: 'Aberrant Blood', required: 12 }], evidence: e('Potions/3.png + Potions/4.png') },
  { name: 'Crafted Potion of Defense Rank 13', outputQuantity: 1, quantityExplicit: false, profession: 'Alchemy', materials: [{ name: "Weeping Willow's Tears", required: 12 }, { name: "Shadowdemon's Eyes", required: 1 }, { name: 'Alkali', required: 1 }, { name: 'Aberrant Bone', required: 12 }], evidence: e('Potions/5.png + Potions/6.png') },
  { name: 'Crafted Potion of Deflect Rank 13', outputQuantity: 1, quantityExplicit: false, profession: 'Alchemy', materials: [{ name: "Weeping Willow's Tears", required: 12 }, { name: "Shadowdemon's Eyes", required: 1 }, { name: 'Alkali', required: 1 }, { name: 'Chamomile', required: 12 }], evidence: e('Potions/7.png + Potions/8.png') },
  { name: 'Crafted Potion of Power Rank 13', outputQuantity: 1, quantityExplicit: false, profession: 'Alchemy', materials: [{ name: "Weeping Willow's Tears", required: 12 }, { name: "Shadowdemon's Eyes", required: 1 }, { name: 'Alkali', required: 1 }, { name: 'Beast Horn', required: 12 }], evidence: e('Potions/9.png + Potions/10.png') },
  { name: "Hermit's Medicinal Tea", outputQuantity: 3, quantityExplicit: true, profession: 'Alchemy', materials: [{ name: "Shadowdemon's Eyes", required: 12 }, { name: 'Hardened Blight Bark', required: 10 }, { name: 'Shade Leaves', required: 6 }, { name: 'Honey', required: 3 }, { name: "Weeping Willow's Tears", required: 3 }], evidence: e('Supplements/1.png') },
  { name: "Hermit's Incense", outputQuantity: 3, quantityExplicit: true, profession: 'Alchemy', materials: [{ name: 'Hardened Blight Bark', required: 12 }, { name: "Troll's Earwax Resin", required: 12 }, { name: 'Feywood Lumber', required: 12 }], evidence: e('Supplements/4.png') },
]

const weaponPairs: Array<[string, string, string]> = [
  ['Barbarian', 'Feywood Broad Slab', 'Barbarian/1.png'], ['Barbarian', "Fey'd Leaf Sword Knot", 'Barbarian/2.png'],
  ['Bard', 'Feywood Lute', 'Bard/1.png'], ['Bard', 'Feywood Rapier', 'Bard/2.png'],
  ['Cleric', 'Silvervine Sceptor', 'cleric/1.png'], ['Cleric', 'Frozen Dew Icon', 'cleric/2.png'],
  ['Fighter', 'Feywood Carved Blade', 'Fighter/1.png'], ['Fighter', 'Feywood Buckler', 'Fighter/2.png'],
  ['Paladin', 'Feywood Club', 'Paladin/1.png'], ['Paladin', 'Feywood Shield', 'Paladin/2.png'],
  ['Ranger', 'Feywood Longbow', 'Ranger/1.png'], ['Ranger', 'Feywood Blades', 'Ranger/2.png'],
  ['Rogue', 'Feywood Stiletto', 'Rogue/1.png'], ['Rogue', 'Feywood Dagger', 'Rogue/2.png'],
  ['Warlock', 'Feywood Pact Blade', 'Warlock/1.png'], ['Warlock', 'Petrified Grimoire', 'Warlock/2.png'],
  ['Wizard', 'Silvervine Orb', 'Wizard/1.png'], ['Wizard', 'Thorned Talisman', 'Wizard/2.png'],
]

const recipeByName = new Map(sharandarRecipes.map((recipe) => [recipe.name, recipe]))

const provenance = (path: string, note?: string) => ({
  gameData: 'User-supplied Sharandar screenshot pack',
  recipe: `Sharandar.zip · ${path}`,
  image: `Sharandar.zip · ${path}`,
  evidence: note ? [`Sharandar.zip · ${path}`, note] : [`Sharandar.zip · ${path}`],
})

export const sharandarItems: Array<Record<string, unknown>> = [
  ...weaponPairs.map(([className, name, path]) => ({
    id: `sharandar-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    name,
    kind: 'Weapon',
    classes: [className],
    slot: null,
    categories: ['Sharandar', 'Masterwork', 'Class weapon'],
    profession: recipeByName.get(name)?.profession ?? null,
    variants: [],
    materials: recipeByName.get(name)?.materials ?? [],
    sourceStatus: 'sharandar-screenshot',
    campaign: 'Sharandar',
    recipeKnown: true,
    provenance: provenance(path),
  })),
  {
    id: 'sharandar-feywood-sprouts', name: 'Feywood Sprouts', kind: 'Armor', classes: ['Barbarian'], slot: null,
    categories: ['Sharandar', 'Masterwork'], profession: 'Tailoring', variants: [], materials: recipeByName.get('Feywood Sprouts')?.materials ?? [],
    sourceStatus: 'sharandar-screenshot', campaign: 'Sharandar', recipeKnown: true, provenance: provenance('Barbarian/3.png', 'Tailoring is visible in the crafting screen.'),
  },
  ...[
    ['Lacquered Leaf Waders', 'Feet', 'Miscellaneous/1.png'],
    ['Petrified Braces', 'Arms', 'Miscellaneous/2.png'],
    ['Petrified Wraps', 'Arms', 'Miscellaneous/4.png'],
    ['Petrified Wristlets', 'Arms', 'Miscellaneous/6.png'],
    ["Fey'd Leaf Branches", 'Arms', 'Miscellaneous/8.png'],
    ['Feywood Bark', 'Armor', 'Miscellaneous/10.png'],
    ['Petrified Bark Barbute', 'Head', 'Miscellaneous/12.png'],
    ['Feywood Bark Barbute', 'Head', 'Miscellaneous/14.png'],
    ['Sprouting Crown', 'Head', 'Miscellaneous/15.png'],
    ["Fey'd Leaf Wood Crown", 'Head', 'Miscellaneous/16.png'],
  ].map(([name, slot, path]) => ({
    id: `sharandar-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    name, kind: 'Armor', classes: [], slot, categories: ['Sharandar', 'Masterwork', 'Class restriction not visible'], profession: recipeByName.get(name)?.profession ?? null,
    variants: [], materials: recipeByName.get(name)?.materials ?? [], sourceStatus: 'sharandar-screenshot', campaign: 'Sharandar', recipeKnown: true,
    provenance: provenance(path, 'The supplied recipe crop does not show a class restriction; the app leaves class unassigned instead of guessing.'),
  })),
  {
    id: 'sharandar-feyd-leaf-branches-wizard', name: "Fey'd Leaf Branches", kind: 'Armor', classes: ['Wizard'], slot: 'Arms', categories: ['Sharandar', 'Masterwork'], profession: null,
    variants: [{ quality: 'Normal', itemLevel: 1550, stats: { 'Combat Advantage': 698, 'Critical Severity': 465, Defense: 1162, 'Combined Rating': 1395 } }],
    itemLevel: 1550, stats: { 'Combat Advantage': 698, 'Critical Severity': 465, Defense: 1162, 'Combined Rating': 1395 }, bind: 'Binds on Equip (Character)', levelRequirement: 20,
    equipPower: { name: "Survivor's Finesse", text: 'When health is 50% or more, Critical Severity is increased by 7,500. When health is below 50%, Deflection is increased by 7,500.' }, reinforced: 'Empty',
    materials: recipeByName.get("Fey'd Leaf Branches")?.materials ?? [], sourceStatus: 'sharandar-screenshot', campaign: 'Sharandar', recipeKnown: true,
    provenance: provenance('Wizard/4.png + Miscellaneous/8.png', 'Wizard tooltip supplies item level, stats, equip power, bind, slot, and minimum level; Miscellaneous/8.png supplies the recipe.'),
  },
  {
    id: 'sharandar-feyd-leaf-wood-crown-wizard', name: "Fey'd Leaf Wood Crown", kind: 'Armor', classes: ['Wizard'], slot: 'Head', categories: ['Sharandar', 'Masterwork'], profession: null,
    variants: [{ quality: 'Normal', itemLevel: 1550, stats: { 'Combat Advantage': 465, 'Critical Strike': 698, Defense: 1162, 'Combined Rating': 1395 } }],
    itemLevel: 1550, stats: { 'Combat Advantage': 465, 'Critical Strike': 698, Defense: 1162, 'Combined Rating': 1395 }, bind: 'Binds on Equip (Character)', levelRequirement: 20,
    equipPower: { name: "Survivor's Savagery", text: 'When health is 50% or more, Critical Strike is increased by 7,500. When health is below 50%, Critical Avoidance is increased by 7,500.' }, reinforced: 'Empty',
    materials: recipeByName.get("Fey'd Leaf Wood Crown")?.materials ?? [], sourceStatus: 'sharandar-screenshot', campaign: 'Sharandar', recipeKnown: true,
    provenance: provenance('Wizard/5.png + Miscellaneous/16.png', 'Wizard tooltip supplies item level, stats, equip power, bind, slot, and minimum level; Miscellaneous/16.png supplies the recipe.'),
  },
  {
    id: 'sharandar-feyd-leaf-wood-wraps-wizard', name: "Fey'd Leaf Wood Wraps", kind: 'Armor', classes: ['Wizard'], slot: 'Arms', categories: ['Sharandar', 'Masterwork', 'Recipe not captured'], profession: null,
    variants: [{ quality: 'Normal', itemLevel: 1550, stats: { 'Combat Advantage': 698, 'Critical Strike': 465, Defense: 1162, 'Combined Rating': 1395 } }],
    itemLevel: 1550, stats: { 'Combat Advantage': 698, 'Critical Strike': 465, Defense: 1162, 'Combined Rating': 1395 }, bind: 'Binds on Equip (Character)', levelRequirement: 20,
    equipPower: { name: "Survivor's Finesse", text: 'When health is 50% or more, Critical Severity is increased by 7,500. When health is below 50%, Deflection is increased by 7,500.' }, reinforced: 'Empty',
    materials: [], sourceStatus: 'sharandar-screenshot-tooltip', campaign: 'Sharandar', recipeKnown: false,
    provenance: provenance('Wizard/3.png + Miscellaneous/9.png', 'The supplied screenshots show the item tooltip/name but not its crafting inputs.'),
  },
  {
    id: 'sharandar-feyd-leaf-branch-crown-wizard', name: "Fey'd Leaf Branch Crown", kind: 'Armor', classes: ['Wizard'], slot: 'Head', categories: ['Sharandar', 'Masterwork', 'Recipe not captured'], profession: null,
    variants: [{ quality: 'Normal', itemLevel: 1550, stats: { 'Critical Strike': 698, 'Critical Severity': 465, Defense: 1162, 'Combined Rating': 1395 } }],
    itemLevel: 1550, stats: { 'Critical Strike': 698, 'Critical Severity': 465, Defense: 1162, 'Combined Rating': 1395 }, bind: 'Binds on Equip (Character)', levelRequirement: 20,
    equipPower: { name: "Survivor's Savagery", text: 'When health is 50% or more, Critical Strike is increased by 7,500. When health is below 50%, Critical Avoidance is increased by 7,500.' }, reinforced: 'Empty',
    materials: [], sourceStatus: 'sharandar-screenshot-tooltip', campaign: 'Sharandar', recipeKnown: false, provenance: provenance('Wizard/6.png', 'Tooltip is captured; recipe is not present in the supplied pack.'),
  },
  {
    id: 'sharandar-twig-crown-warlock', name: 'Twig Crown', kind: 'Armor', classes: ['Warlock'], slot: 'Head', categories: ['Sharandar', 'Masterwork', 'Recipe not captured'], profession: null,
    variants: [{ quality: 'Normal', itemLevel: 1550, stats: { 'Critical Strike': 698, 'Critical Severity': 465, Defense: 1162, 'Combined Rating': 1395 } }],
    itemLevel: 1550, stats: { 'Critical Strike': 698, 'Critical Severity': 465, Defense: 1162, 'Combined Rating': 1395 }, bind: 'Binds on Equip (Character)', levelRequirement: 20,
    equipPower: { name: "Survivor's Savagery", text: 'When health is 50% or more, Critical Strike is increased by 7,500. When health is below 50%, Critical Avoidance is increased by 7,500.' }, reinforced: 'Empty',
    materials: [], sourceStatus: 'sharandar-screenshot-tooltip', campaign: 'Sharandar', recipeKnown: false, provenance: provenance('Warlock/3.png', 'Tooltip is captured; recipe is not present in the supplied pack.'),
  },
  ...[
    ['Petrified Armlets', 'Arms', 'Miscellaneous/3.png'], ['Petrified Guards', 'Arms', 'Miscellaneous/5.png'], ['Petrified Wristguards', 'Arms', 'Miscellaneous/7.png'],
    ['Feywood Blightbark', 'Armor', 'Miscellaneous/11.png'], ['Petrified Barbute', 'Head', 'Miscellaneous/13.png'],
  ].map(([name, slot, path]) => ({
    id: `sharandar-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`, name, kind: 'Armor', classes: [], slot,
    categories: ['Sharandar', 'Masterwork', 'Recipe not captured', 'Class restriction not visible'], profession: null, variants: [], materials: [],
    sourceStatus: 'sharandar-screenshot-name-only', campaign: 'Sharandar', recipeKnown: false,
    provenance: provenance(path, 'The supplied crop shows the craftable name/icon but not the full recipe or class restriction.'),
  })),
  ...[
    ['Crafted Potion of Accuracy Rank 13', 'Accuracy', 5100, 20, 'Potions/1.png + Potions/2.png'],
    ['Crafted Potion of Critical Strike Rank 13', 'Critical Strike', 5100, 20, 'Potions/3.png + Potions/4.png'],
    ['Crafted Potion of Defense Rank 13', 'Defense', 5100, 20, 'Potions/5.png + Potions/6.png'],
    ['Crafted Potion of Deflect Rank 13', 'Deflect Rating', 5100, 20, 'Potions/7.png + Potions/8.png'],
    ['Crafted Potion of Power Rank 13', 'Power', 3600, 18, 'Potions/9.png + Potions/10.png'],
  ].map(([name, stat, amount, minLevel, path]) => ({
    id: `sharandar-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`, name, kind: 'Consumable', classes: ['All'], slot: null,
    categories: ['Sharandar', 'Masterwork', 'Potion'], profession: 'Alchemy', variants: [{ quality: '+1' }], levelRequirement: minLevel,
    equipPower: { name: `${stat} potion`, text: `Increases ${stat} by ${Number(amount).toLocaleString()} for 3,600 seconds. Persists through death. Only one normal stat-enhancing potion can be in effect at one time.` },
    materials: recipeByName.get(String(name))?.materials ?? [], sourceStatus: 'sharandar-screenshot', campaign: 'Sharandar', recipeKnown: true, provenance: provenance(String(path)),
  })),
  {
    id: 'sharandar-hermits-medicinal-tea', name: "Hermit's Medicinal Tea", kind: 'Supplement', classes: ['All'], slot: null, categories: ['Sharandar', 'Masterwork', 'Supplement'], profession: 'Alchemy', levelRequirement: 20,
    variants: [{ quality: 'Normal', itemLevel: 105, stats: { Focus: 125 } }, { quality: '+1', itemLevel: 110, stats: { Focus: 150 } }],
    materials: recipeByName.get("Hermit's Medicinal Tea")?.materials ?? [], sourceStatus: 'sharandar-screenshot', campaign: 'Sharandar', recipeKnown: true,
    provenance: provenance('Supplements/1.png + Supplements/2.png + Supplements/3.png', 'Normal: item level 105, +125 Focus. +1: item level 110, +150 Focus. Requires profession level 20.'),
  },
  {
    id: 'sharandar-hermits-incense', name: "Hermit's Incense", kind: 'Supplement', classes: ['All'], slot: null, categories: ['Sharandar', 'Masterwork', 'Supplement'], profession: 'Alchemy', levelRequirement: 20,
    variants: [{ quality: 'Normal', itemLevel: 90, stats: { Proficiency: 125 } }, { quality: '+1', itemLevel: 90, stats: { Proficiency: 150 } }],
    materials: recipeByName.get("Hermit's Incense")?.materials ?? [], sourceStatus: 'sharandar-screenshot', campaign: 'Sharandar', recipeKnown: true,
    provenance: provenance('Supplements/4.png + Supplements/5.png + Supplements/6.png', 'Normal: item level 90, +125 Proficiency. +1: item level 90, +150 Proficiency. Requires profession level 20.'),
  },
]

export const sharandarWorkshopReference = {
  sourceUrls: [
    'https://nwo.tbotr.net/professions/index.php',
    'https://nwo.tbotr.net/professions/sstc.php',
    'https://nwo.tbotr.net/professions/artisans.php',
    'https://www.nwo-uncensored.com/blog/workshop-artisan-guide/',
  ],
  workshopBasics: [
    'The Workshop Opportunity tutorial is introduced at character level 8 after the Vellosk adventure and returning to Sgt. Knox.',
    'Retainer choice does not affect crafting ability.',
    'The seven starting professions listed by the guide are Alchemy, Armorsmithing, Artificing, Blacksmithing, Jewelcrafting, Leatherworking, and Tailoring; all professions can eventually be used.',
    'The tutorial recommends Alchemy and Jewelcrafting as especially useful at lower levels.',
    'Initial applications include two adventurers for Gathering tasks and two artisans from the selected profession.',
    'The first workstation craft uses Morale; Gathering tasks cannot use Morale.',
  ],
  artisanMechanics: [
    { key: 'Proficiency', text: 'Artisan proficiency, tool proficiency, and an optional supplement determine the chance to craft successfully.' },
    { key: 'Focus', text: 'After a successful craft, artisan focus, tool focus, and an optional supplement determine whether the result is high-quality.' },
    { key: 'Commission', text: 'Modifies the crafting cost; a negative commission modifier lowers the cost.' },
    { key: 'Speed', text: 'Modifies crafting time; a positive speed modifier shortens the task.' },
    { key: 'Dab Hand', text: 'Chance to receive double materials from most material-producing tasks.' },
    { key: 'Miracle Worker', text: 'Chance to complete a task instantly or without consuming Morale.' },
    { key: 'Passion Project', text: 'Chance to negate the commission cost of a task.' },
    { key: 'Recycle', text: 'Chance to keep all materials when a task fails.' },
    { key: 'Virtuoso', text: 'Chance to receive the effect of the slotted supplement without consuming it.' },
  ],
  artisanHighlights: [
    { profession: 'Adventurers', mostProficient: 'Krunng Sweetwater (450)', mostFocused: 'Pan Whitewood (450)', leastExpensive: 'Dorrak (-25%)', fastest: 'Evelyn Nara (+200%)', topThree: ['Heyra Keeneye', 'Dorrak', "Xerazze D'Zzen"] },
    { profession: 'Alchemy', mostProficient: 'Minda Breskhild (450)', mostFocused: 'Beatrice (450)', leastExpensive: 'Adloquium (-75%)', fastest: 'Yungric (+125%)', topThree: ['Adloquium', 'Paelinn Shardhilt', 'Kilij Harran'] },
    { profession: 'Armorsmithing', mostProficient: 'Dain Hephdal (450)', mostFocused: 'Elsbeth Missaglias (450)', leastExpensive: 'Bitrid Brasshammer (-75%)', fastest: 'Silael Steelwhisper (+125%)', topThree: ['Mitra Lashgari', 'Dorfok Guggenston', 'Gutrid Staranvil'] },
    { profession: 'Artificing', mostProficient: 'Belmen Ironarms (450)', mostFocused: 'Dolben Lodestone (450)', leastExpensive: 'Brodun Comawn (-50%)', fastest: 'Evelyn Chiaroscuro (+150%)', topThree: ['Dolben Lodestone', 'Everyt Lathulien', 'Kevh Oleme'] },
    { profession: 'Blacksmithing', mostProficient: 'Gohrr Kuldin (450)', mostFocused: 'Zinaida (450)', leastExpensive: 'Donnen Millkeep (-75%)', fastest: 'Tia Ingelri (+100%)', topThree: ['Gohrr Kuldin', 'Tia Ingelri', 'Trodinn Deepstone'] },
    { profession: 'Jewelcrafting', mostProficient: 'Olin Diamondeye (444)', mostFocused: 'Volen Naimne (450)', leastExpensive: 'Haie Xilomne (-75%)', fastest: 'Pharlen Ghiberti (+175%)', topThree: ["Halsstra T'Zovrrin", 'Pharlen Ghiberti', 'Bree Underleaf'] },
    { profession: 'Leatherworking', mostProficient: 'Brokkah (450)', mostFocused: 'Yul Summerstar (450)', leastExpensive: 'Brokkah (-75%)', fastest: 'Alma Greydawn (+200%)', topThree: ['Brokkah', 'Krassyk', 'Emlyn Feststone'] },
    { profession: 'Tailoring', mostProficient: 'Sey Mapleway (450)', mostFocused: 'Isayel Kostrad (450)', leastExpensive: 'Treylo Grassmantle (-75%)', fastest: 'Inaya Lanuit (+200%)', topThree: ['Sey Mapleway', "Sezzra D'rrol", 'Isayel Kostrad'] },
  ],
  legacyMasterworkRecommendations: [
    ['Tuala Uwoke', 'Jewelcrafting', 385, 385, 'Dab Hand (20%)'], ['Charlette Favri', 'Jewelcrafting', 370, 400, 'Recycle (25%)'],
    ['Adloquium', 'Alchemy', 375, 360, 'Dab Hand (20%)'], ['Efla Parkatha', 'Alchemy', 395, 395, 'Virtuoso (25%)'], ['Minda Breskhild', 'Alchemy', 400, 350, 'Recycle (25%)'], ['Beatrice', 'Alchemy', 345, 400, 'Recycle (25%)'],
    ['Tomaso Missaglias', 'Armorsmithing', 345, 400, 'Dab Hand (25%)'], ['Elsbeth Missaglias', 'Armorsmithing', 385, 400, 'Recycle (25%)'], ['Dain Hephdal', 'Armorsmithing', 400, 380, 'Recycle (20%)'],
    ['Stella Everstream', 'Artificing', 360, 400, 'Recycle (25%)'], ['Gunter Morthrad', 'Artificing', 370, 400, 'Dab Hand (20%)'],
    ['Zinaida', 'Blacksmithing', 400, 400, 'Dab Hand (20%)'], ['Tokuro Osafune', 'Blacksmithing', 360, 400, 'Recycle (25%)'],
    ['Lond Dawnwhisper', 'Leatherworking', 380, 380, 'Dab Hand (25%)'], ['Sandurai Astemmdal', 'Leatherworking', 400, 320, 'Recycle (25%)'],
    ['Yeul Gustaverg', 'Tailoring', 390, 370, 'Dab Hand (25%)'], ['Teclel Jondrathal', 'Tailoring', 400, 400, 'Recycle (25%)'],
  ],
  gatheringRecommendations: [
    ['Trys Kiirendal', 360, 395, '+50%', 'Passion Project (25%)'], ['Evelyn Nara', 325, 400, '+200%', 'Miracle Worker (25%)'],
    ['Murchadh Ossian', 370, 370, '+25%', 'Dab Hand (10%)'], ['Krunng Sweetwater', 400, 380, '+0%', 'Dab Hand (20%)'],
  ],
  southSeas: {
    cycleDays: 16,
    listDays: [
      { list: 1, days: [1, 6, 14] }, { list: 2, days: [2, 7] }, { list: 3, days: [3, 9] }, { list: 4, days: [4, 10] },
      { list: 5, days: [5, 12] }, { list: 6, days: [8, 15] }, { list: 7, days: [11, 13, 16] },
    ],
    note: 'The source describes a seven-list, 16-day repeating commission schedule used for upgrading the Workshop from level 2 upward. Highlighting/underlining on the source page marks the cheapest craft-from-scratch choices for Workshop level 3/4.',
  },
  sourceCaveats: [
    'The TBotR artisan page states that only 74 of 210 level-80 artisan rows were verified and the remaining rows were inferred from the verified pattern.',
    'The Neverwinter:Unblogged artisan recommendations are a Module 15-era guide; they are preserved as historical recommendations and are not silently substituted for the newer TBotR level-80 summary values.',
  ],
} as const
