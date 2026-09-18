/**
 * Historical post-2018 Masterwork IV/V task-table snapshot.
 *
 * The publisher renamed Masterwork IV/V to Chultan Masterwork I/II in 2021.
 * These community-maintained task tables are therefore reference evidence,
 * not a September 2026 live-game certification and not planner input.
 *
 * Reviewed: 2026-09-18.
 */
export type ChultanHistoricalProfession =
  | 'Alchemy'
  | 'Armorsmithing'
  | 'Artificing'
  | 'Blacksmithing'
  | 'Jewelcrafting'
  | 'Leatherworking'
  | 'Tailoring'

export type ChultanHistoricalTier = 'IV' | 'V'

export interface ChultanHistoricalTaskRow {
  profession: ChultanHistoricalProfession
  historicalTier: ChultanHistoricalTier
  name: string
  outputQuantity: number
  materials: { name: string; quantity: number }[]
  sourceUrl: string
}

export const CHULTAN_HISTORICAL_TASKS_REVIEWED_AT = '2026-09-18'
export const CHULTAN_HISTORICAL_TASKS_NOTICE =
  'Historical post-2018 profession task tables. Masterwork IV/V were renamed Chultan Masterwork I/II in 2021. Treat these rows as reference evidence only: source pages may be incomplete, may disagree with other community worksheets, and do not certify September 2026 live recipes.'

export const chultanHistoricalTaskRows: ChultanHistoricalTaskRow[] = [
  {
    "profession": "Alchemy",
    "historicalTier": "IV",
    "name": "Lakh Varnish",
    "outputQuantity": 3,
    "materials": [
      {
        "name": "Lakh Resin",
        "quantity": 15
      },
      {
        "name": "Terebinth",
        "quantity": 5
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Alchemy"
  },
  {
    "profession": "Alchemy",
    "historicalTier": "IV",
    "name": "Living Varnish",
    "outputQuantity": 3,
    "materials": [
      {
        "name": "Tear of Ubtao",
        "quantity": 1
      },
      {
        "name": "Lakh Varnish",
        "quantity": 3
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Alchemy"
  },
  {
    "profession": "Alchemy",
    "historicalTier": "IV",
    "name": "Commissioned Fever Reducer",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Red Alder Bark",
        "quantity": 4
      },
      {
        "name": "Madder Root",
        "quantity": 4
      },
      {
        "name": "Effervescent Water",
        "quantity": 4
      },
      {
        "name": "Alkali",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Alchemy"
  },
  {
    "profession": "Alchemy",
    "historicalTier": "IV",
    "name": "Commissioned Hull Coating",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Shark Oil",
        "quantity": 4
      },
      {
        "name": "Charcoal",
        "quantity": 4
      },
      {
        "name": "Oil of Vitriol",
        "quantity": 1
      },
      {
        "name": "Lakh Resin",
        "quantity": 2
      },
      {
        "name": "Spruce Resin",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Alchemy"
  },
  {
    "profession": "Alchemy",
    "historicalTier": "IV",
    "name": "Commissioned Incense",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Red Alder Bark",
        "quantity": 6
      },
      {
        "name": "Burgundy Pitch",
        "quantity": 4
      },
      {
        "name": "Palm Wax",
        "quantity": 2
      },
      {
        "name": "Charcoal",
        "quantity": 2
      },
      {
        "name": "Spruce Lumber",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Alchemy"
  },
  {
    "profession": "Alchemy",
    "historicalTier": "IV",
    "name": "Commissioned Medicinal Tea",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Chultan Tea Leaves",
        "quantity": 4
      },
      {
        "name": "Woad",
        "quantity": 4
      },
      {
        "name": "Senna Leaves",
        "quantity": 2
      },
      {
        "name": "Chultan Spring Water",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Alchemy"
  },
  {
    "profession": "Alchemy",
    "historicalTier": "IV",
    "name": "Maple Rot Draught",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Chultan Spring Water",
        "quantity": 4
      },
      {
        "name": "Tanner's Liquor",
        "quantity": 2
      },
      {
        "name": "Livewood Sap",
        "quantity": 1
      },
      {
        "name": "Slaked Lime",
        "quantity": 6
      },
      {
        "name": "Copper Sand",
        "quantity": 6
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Alchemy"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Bronzewood Lumber",
    "outputQuantity": 4,
    "materials": [
      {
        "name": "Bronzewood Log",
        "quantity": 12
      },
      {
        "name": "Tincal",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Hardened Bronzewood",
    "outputQuantity": 2,
    "materials": [
      {
        "name": "Bronzewood Lumber",
        "quantity": 4
      },
      {
        "name": "Lakh Varnish",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Commissioned Buckler",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Plate",
        "quantity": 4
      },
      {
        "name": "Titania",
        "quantity": 4
      },
      {
        "name": "Dark Alum",
        "quantity": 2
      },
      {
        "name": "Spruce Lumber",
        "quantity": 2
      },
      {
        "name": "Lakh Varnish",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Commissioned Compy Wire",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ore",
        "quantity": 6
      },
      {
        "name": "Molybdena",
        "quantity": 3
      },
      {
        "name": "Shark Oil",
        "quantity": 2
      },
      {
        "name": "Propolis Varnish",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Commissioned Fishing Rod",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Bronzewood Lumber",
        "quantity": 2
      },
      {
        "name": "Elm Lumber",
        "quantity": 2
      },
      {
        "name": "Teak Lumber",
        "quantity": 2
      },
      {
        "name": "Brass Ingot",
        "quantity": 1
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Commissioned Hull Sheathing",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Brass Ingot",
        "quantity": 8
      },
      {
        "name": "Copper Ingot",
        "quantity": 2
      },
      {
        "name": "Wootz Steel Ore",
        "quantity": 2
      },
      {
        "name": "Native Iron",
        "quantity": 2
      },
      {
        "name": "Coke",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Commissioned Shipwright Bolts",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ore",
        "quantity": 6
      },
      {
        "name": "Brass Ingot",
        "quantity": 4
      },
      {
        "name": "Molybdena",
        "quantity": 2
      },
      {
        "name": "Relic Iron Ingot",
        "quantity": 1
      },
      {
        "name": "Coke",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Commissioned Spiked Barricade",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Hardened Bronzewood",
        "quantity": 4
      },
      {
        "name": "Titansteel Plate",
        "quantity": 1
      },
      {
        "name": "Adamant Nails",
        "quantity": 4
      },
      {
        "name": "Lakh Varnish",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Commissioned Timepiece",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Timepiece",
        "quantity": 1
      },
      {
        "name": "Brass Ingot",
        "quantity": 2
      },
      {
        "name": "Titansteel Rings",
        "quantity": 2
      },
      {
        "name": "Scintillant Glass",
        "quantity": 1
      },
      {
        "name": "Artisan's Enamel",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Commissioned Tyrannosaur Barding",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Titansteel Plate",
        "quantity": 3
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 2
      },
      {
        "name": "Titansteel Rings",
        "quantity": 2
      },
      {
        "name": "Red Enamel",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Brightsilver Fishing Reel",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Brightsilver Ingot",
        "quantity": 4
      },
      {
        "name": "Brass Ingot",
        "quantity": 2
      },
      {
        "name": "Titansteel Rings",
        "quantity": 4
      },
      {
        "name": "Hardsand",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "IV",
    "name": "Statue of the Great King",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Copper Ingot",
        "quantity": 12
      },
      {
        "name": "Red Rouge",
        "quantity": 4
      },
      {
        "name": "Red Enamel",
        "quantity": 2
      },
      {
        "name": "White Enamel",
        "quantity": 2
      },
      {
        "name": "Blue Enamel",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Armorsmithing",
    "historicalTier": "V",
    "name": "Bronzewood Mahuizzochimalli",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Living Bronzewood",
        "quantity": 3
      },
      {
        "name": "Feathered Ornament",
        "quantity": 3
      },
      {
        "name": "Obsidian Shard",
        "quantity": 4
      },
      {
        "name": "Lion Fur",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Armorsmithing_page_2"
  },
  {
    "profession": "Artificing",
    "historicalTier": "IV",
    "name": "Bronzewood Lumber",
    "outputQuantity": 4,
    "materials": [
      {
        "name": "Bronzewood Log",
        "quantity": 12
      },
      {
        "name": "Tincal",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "IV",
    "name": "Living Bronzewood",
    "outputQuantity": 3,
    "materials": [
      {
        "name": "Bronzewood Lumber",
        "quantity": 4
      },
      {
        "name": "Tear of Ubtao",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "IV",
    "name": "Lichstone Enamel",
    "outputQuantity": 3,
    "materials": [
      {
        "name": "Lichstone",
        "quantity": 1
      },
      {
        "name": "Artisan's Enamel",
        "quantity": 4
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "IV",
    "name": "Commissioned Cambist's Scales",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Brass Ingot",
        "quantity": 4
      },
      {
        "name": "Magicked Enamel",
        "quantity": 4
      },
      {
        "name": "Gold Wire",
        "quantity": 2
      },
      {
        "name": "Shark Oil",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "IV",
    "name": "Commissioned Hull",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Teak Lumber",
        "quantity": 20
      },
      {
        "name": "Oak Lumber",
        "quantity": 6
      },
      {
        "name": "Titansteel Nails",
        "quantity": 4
      },
      {
        "name": "Lakh Varnish",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "IV",
    "name": "Commissioned Lacquer",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Lakh Resin",
        "quantity": 4
      },
      {
        "name": "Propolis",
        "quantity": 4
      },
      {
        "name": "Magicked Enamel",
        "quantity": 2
      },
      {
        "name": "Burgundy Pitch",
        "quantity": 1
      },
      {
        "name": "Chultan Spring Water",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "IV",
    "name": "Commissioned Sextant",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Brightsilver Ingot",
        "quantity": 4
      },
      {
        "name": "Scintillant Glass",
        "quantity": 2
      },
      {
        "name": "Red Rouge",
        "quantity": 1
      },
      {
        "name": "Artisan's Enamel",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "IV",
    "name": "Soulsight Spectacles",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Gold Wire",
        "quantity": 2
      },
      {
        "name": "Scintillant Glass",
        "quantity": 2
      },
      {
        "name": "Red Rouge",
        "quantity": 4
      },
      {
        "name": "Lichstone Enamel",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "V",
    "name": "Fanged Quiilpia",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Living Bronzewood",
        "quantity": 3
      },
      {
        "name": "Brilliant Bead",
        "quantity": 4
      },
      {
        "name": "Fanged Ornament",
        "quantity": 2
      },
      {
        "name": "Chultan Silk Thread",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "V",
    "name": "Feathered Ilhuilli",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Soulfired Obsidian",
        "quantity": 3
      },
      {
        "name": "Hardened Bronzewood",
        "quantity": 4
      },
      {
        "name": "Fanged Ornament",
        "quantity": 2
      },
      {
        "name": "Lakh Varnish",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "V",
    "name": "Bronzewood Tlahuitolli",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Living Bronzewood",
        "quantity": 3
      },
      {
        "name": "Feathered Ornament",
        "quantity": 2
      },
      {
        "name": "Obsidian Shard",
        "quantity": 2
      },
      {
        "name": "Chultan Silk Thread",
        "quantity": 2
      },
      {
        "name": "Lakh Varnish",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "V",
    "name": "Feathered Teotlanextli",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Living Bronzewood",
        "quantity": 3
      },
      {
        "name": "Jute Macrame",
        "quantity": 4
      },
      {
        "name": "Feathered Ornament",
        "quantity": 2
      },
      {
        "name": "Obsidian Shard",
        "quantity": 1
      },
      {
        "name": "Lakh Varnish",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Artificing",
    "historicalTier": "V",
    "name": "Obsidian Miztonhiyo",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Living Bronzewood",
        "quantity": 3
      },
      {
        "name": "Jute Macrame",
        "quantity": 4
      },
      {
        "name": "Feathered Ornament",
        "quantity": 2
      },
      {
        "name": "Obsidian Shard",
        "quantity": 1
      },
      {
        "name": "Lakh Varnish",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Artificing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "IV",
    "name": "Obsidian Shard",
    "outputQuantity": 4,
    "materials": [
      {
        "name": "Obsidian",
        "quantity": 12
      },
      {
        "name": "Red Rouge",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "IV",
    "name": "Soulfired Obsidian",
    "outputQuantity": 3,
    "materials": [
      {
        "name": "Obsidian Shard",
        "quantity": 4
      },
      {
        "name": "Mote of Soulfire",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "IV",
    "name": "Commissioned Assassin's Dagger",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Obsidian Shard",
        "quantity": 3
      },
      {
        "name": "Hardened Bronzewood",
        "quantity": 2
      },
      {
        "name": "Dark Lacquer",
        "quantity": 2
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "IV",
    "name": "Commissioned Butcher's Knife",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ingot",
        "quantity": 4
      },
      {
        "name": "Laminated Steel Blade",
        "quantity": 2
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 2
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "IV",
    "name": "Commissioned Machete",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Laminated Adamant Blade",
        "quantity": 2
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 2
      },
      {
        "name": "Artisan's Enamel",
        "quantity": 1
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "IV",
    "name": "Commissioned Scalepiercer Arrows",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Titansteel Ingot",
        "quantity": 1
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 4
      },
      {
        "name": "Brilliant Pinion",
        "quantity": 2
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "IV",
    "name": "Fullered Yklwah Blade",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Laminated Adamant Blade",
        "quantity": 2
      },
      {
        "name": "Titansteel Ingot",
        "quantity": 4
      },
      {
        "name": "Hardsand",
        "quantity": 2
      },
      {
        "name": "Artisan's Enamel",
        "quantity": 1
      },
      {
        "name": "Coke",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Wootz Cross-pein Hammer",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ingot",
        "quantity": 2
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 1
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 2
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Wootz File",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ingot",
        "quantity": 3
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 1
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Wootz Hatchet",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ingot",
        "quantity": 2
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 1
      },
      {
        "name": "Shark Oil",
        "quantity": 3
      },
      {
        "name": "Artisan's Putty",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Wootz Pickaxe",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ingot",
        "quantity": 3
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 1
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Wootz Raising Hammer",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ingot",
        "quantity": 2
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 1
      },
      {
        "name": "Chultan Silk",
        "quantity": 2
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Wootz Round Knife",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ingot",
        "quantity": 2
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 2
      },
      {
        "name": "Artisan's Putty",
        "quantity": 1
      },
      {
        "name": "Shark Oil",
        "quantity": 3
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Wootz Scythe",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Wootz Steel Ingot",
        "quantity": 2
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 1
      },
      {
        "name": "Lakh Varnish",
        "quantity": 2
      },
      {
        "name": "Slate Whetstone",
        "quantity": 3
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Obsidian Itecpayo",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Soulfired Obsidian",
        "quantity": 3
      },
      {
        "name": "Hardened Bronzewood",
        "quantity": 4
      },
      {
        "name": "Feathered Ornament",
        "quantity": 2
      },
      {
        "name": "Brightsilver Ingot",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Obsidian Itztopilli",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Soulfired Obsidian",
        "quantity": 3
      },
      {
        "name": "Hardened Bronzewood",
        "quantity": 4
      },
      {
        "name": "Lion Fur",
        "quantity": 2
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Bronzewood Huitzauhqui",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Soulfired Obsidian",
        "quantity": 3
      },
      {
        "name": "Hardened Bronzewood",
        "quantity": 4
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 2
      },
      {
        "name": "Brightsilver Ingot",
        "quantity": 3
      },
      {
        "name": "Red Enamel",
        "quantity": 4
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Bronzewood Macuahuitl",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Soulfired Obsidian",
        "quantity": 3
      },
      {
        "name": "Hardened Bronzewood",
        "quantity": 4
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 2
      },
      {
        "name": "Brightsilver Ingot",
        "quantity": 3
      },
      {
        "name": "Sphene",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Bronzewood Quauhololli",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Soulfired Obsidian",
        "quantity": 3
      },
      {
        "name": "Hardened Bronzewood",
        "quantity": 4
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 2
      },
      {
        "name": "Dark Lacquer",
        "quantity": 3
      },
      {
        "name": "Chultan Silk",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Blacksmithing",
    "historicalTier": "V",
    "name": "Obsidian Omihuictli",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Soulfired Obsidian",
        "quantity": 3
      },
      {
        "name": "Obsidian Shard",
        "quantity": 4
      },
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 2
      },
      {
        "name": "Hardened Bronzewood",
        "quantity": 1
      },
      {
        "name": "Feathered Ornament",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Blacksmithing"
  },
  {
    "profession": "Jewelcrafting",
    "historicalTier": "IV",
    "name": "Brilliant Bead",
    "outputQuantity": 4,
    "materials": [
      {
        "name": "Batiri Prism",
        "quantity": 12
      },
      {
        "name": "Scintillant Glass",
        "quantity": 4
      },
      {
        "name": "Red Rouge",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Jewelcrafting"
  },
  {
    "profession": "Jewelcrafting",
    "historicalTier": "IV",
    "name": "Fanged Ornament",
    "outputQuantity": 2,
    "materials": [
      {
        "name": "Brilliant Bead",
        "quantity": 4
      },
      {
        "name": "Jute Macrame",
        "quantity": 3
      },
      {
        "name": "Allosaur Fang",
        "quantity": 6
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Jewelcrafting"
  },
  {
    "profession": "Jewelcrafting",
    "historicalTier": "IV",
    "name": "Feathered Ornament",
    "outputQuantity": 2,
    "materials": [
      {
        "name": "Brilliant Bead",
        "quantity": 4
      },
      {
        "name": "Jute Macrame",
        "quantity": 3
      },
      {
        "name": "Brilliant Pinion",
        "quantity": 12
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Jewelcrafting"
  },
  {
    "profession": "Jewelcrafting",
    "historicalTier": "IV",
    "name": "Commissioned Bangles",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Gold Ingot",
        "quantity": 3
      },
      {
        "name": "Gold Wire",
        "quantity": 2
      },
      {
        "name": "Blue Enamel",
        "quantity": 2
      },
      {
        "name": "Artisan's Enamel",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Jewelcrafting"
  },
  {
    "profession": "Jewelcrafting",
    "historicalTier": "IV",
    "name": "Commissioned Hand Mirror",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Brightsilver Ingot",
        "quantity": 4
      },
      {
        "name": "Red Rouge",
        "quantity": 1
      },
      {
        "name": "Scintillant Glass",
        "quantity": 2
      },
      {
        "name": "Aqua Fortis",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Jewelcrafting"
  },
  {
    "profession": "Jewelcrafting",
    "historicalTier": "IV",
    "name": "Commissioned Silverware",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Brightsilver Ingot",
        "quantity": 4
      },
      {
        "name": "Red Rouge",
        "quantity": 1
      },
      {
        "name": "Hardsand",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Jewelcrafting"
  },
  {
    "profession": "Jewelcrafting",
    "historicalTier": "IV",
    "name": "Commissioned Spyglass",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Brass Ingot",
        "quantity": 6
      },
      {
        "name": "Slaked Lime",
        "quantity": 4
      },
      {
        "name": "Silex",
        "quantity": 4
      },
      {
        "name": "Red Rouge",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Jewelcrafting"
  },
  {
    "profession": "Jewelcrafting",
    "historicalTier": "IV",
    "name": "Tizita Music Box",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Gold Ingot",
        "quantity": 6
      },
      {
        "name": "Brass Ingot",
        "quantity": 4
      },
      {
        "name": "Mainspring",
        "quantity": 1
      },
      {
        "name": "Sphene",
        "quantity": 3
      },
      {
        "name": "Blue Enamel",
        "quantity": 4
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Jewelcrafting"
  },
  {
    "profession": "Leatherworking",
    "historicalTier": "IV",
    "name": "Lion Fur",
    "outputQuantity": 2,
    "materials": [
      {
        "name": "Lion Hide",
        "quantity": 12
      },
      {
        "name": "Tanner's Liquor",
        "quantity": 1
      },
      {
        "name": "Tincal",
        "quantity": 1
      },
      {
        "name": "Alum",
        "quantity": 6
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Leatherworking"
  },
  {
    "profession": "Leatherworking",
    "historicalTier": "IV",
    "name": "Lacquered Dinosaur Leather",
    "outputQuantity": 2,
    "materials": [
      {
        "name": "Chultan Tea Leaves",
        "quantity": 12
      },
      {
        "name": "Tanner's Liquor",
        "quantity": 1
      },
      {
        "name": "Lakh Varnish",
        "quantity": 2
      },
      {
        "name": "Dinosaur Hide",
        "quantity": 8
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Leatherworking"
  },
  {
    "profession": "Leatherworking",
    "historicalTier": "IV",
    "name": "Commissioned Monuted Raptor",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Dinosaur Leather",
        "quantity": 12
      },
      {
        "name": "Alum",
        "quantity": 6
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 2
      },
      {
        "name": "Iron Nails",
        "quantity": 4
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Leatherworking"
  },
  {
    "profession": "Leatherworking",
    "historicalTier": "IV",
    "name": "Commissioned Sailing Boots",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Lacquered Dinosaur Leather",
        "quantity": 4
      },
      {
        "name": "Lined Aberrant Leather",
        "quantity": 2
      },
      {
        "name": "Artisan's Putty",
        "quantity": 2
      },
      {
        "name": "Dubbin",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Leatherworking"
  },
  {
    "profession": "Leatherworking",
    "historicalTier": "IV",
    "name": "Commissioned Triceratops Harness",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Aberrant Leather Strap",
        "quantity": 6
      },
      {
        "name": "Titansteel Rings",
        "quantity": 3
      },
      {
        "name": "Cashmere",
        "quantity": 2
      },
      {
        "name": "Chultan Silk Thread",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Leatherworking"
  },
  {
    "profession": "Leatherworking",
    "historicalTier": "IV",
    "name": "Commissioned Tyrannosaur Saddle",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Manticore Leather",
        "quantity": 4
      },
      {
        "name": "Cashmere",
        "quantity": 2
      },
      {
        "name": "Wootz Steel Rings",
        "quantity": 2
      },
      {
        "name": "Propolis Varnish",
        "quantity": 2
      },
      {
        "name": "Chultan Silk Thread",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Leatherworking"
  },
  {
    "profession": "Leatherworking",
    "historicalTier": "IV",
    "name": "Mounted Tyrannosaur",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Dinosaur Leather",
        "quantity": 32
      },
      {
        "name": "Alum",
        "quantity": 12
      },
      {
        "name": "Bronzewood Lumber",
        "quantity": 6
      },
      {
        "name": "Titansteel Nails",
        "quantity": 4
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Leatherworking"
  },
  {
    "profession": "Tailoring",
    "historicalTier": "IV",
    "name": "Chultan Silk Thread",
    "outputQuantity": 4,
    "materials": [
      {
        "name": "Silkworm Cocoon",
        "quantity": 12
      },
      {
        "name": "Effervescent Water",
        "quantity": 6
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Tailoring"
  },
  {
    "profession": "Tailoring",
    "historicalTier": "IV",
    "name": "Chultan Silk",
    "outputQuantity": 2,
    "materials": [
      {
        "name": "Chultan Silk Thread",
        "quantity": 4
      },
      {
        "name": "Potash",
        "quantity": 1
      },
      {
        "name": "Spider Silk",
        "quantity": 4
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Tailoring"
  },
  {
    "profession": "Tailoring",
    "historicalTier": "IV",
    "name": "Jute Macrame",
    "outputQuantity": 3,
    "materials": [
      {
        "name": "Samarachan Jute",
        "quantity": 15
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Tailoring"
  },
  {
    "profession": "Tailoring",
    "historicalTier": "IV",
    "name": "Commissioned Awning",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Menga Cloth",
        "quantity": 12
      },
      {
        "name": "Jute Macrame",
        "quantity": 4
      },
      {
        "name": "Propolis",
        "quantity": 4
      },
      {
        "name": "Crimson Fabric Dye",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Tailoring"
  },
  {
    "profession": "Tailoring",
    "historicalTier": "IV",
    "name": "Commissioned Carpet",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Cashmere",
        "quantity": 6
      },
      {
        "name": "Samarachan Jute",
        "quantity": 4
      },
      {
        "name": "Chultan Silk Thread",
        "quantity": 4
      },
      {
        "name": "Vermilion Fabric Dye",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Tailoring"
  },
  {
    "profession": "Tailoring",
    "historicalTier": "IV",
    "name": "Commissioned Gown",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Silk Thread",
        "quantity": 8
      },
      {
        "name": "Samite",
        "quantity": 4
      },
      {
        "name": "Snowhare Yarn",
        "quantity": 4
      },
      {
        "name": "Emerald Fabric Dye",
        "quantity": 2
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Tailoring"
  },
  {
    "profession": "Tailoring",
    "historicalTier": "IV",
    "name": "Commissioned Mainsail",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Menga Cloth",
        "quantity": 25
      },
      {
        "name": "Chultan Silk Thread",
        "quantity": 5
      },
      {
        "name": "Artisan's Putty",
        "quantity": 3
      },
      {
        "name": "Potash",
        "quantity": 1
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Tailoring"
  },
  {
    "profession": "Tailoring",
    "historicalTier": "IV",
    "name": "Bundle of Chultan Fabrics",
    "outputQuantity": 1,
    "materials": [
      {
        "name": "Menga Cloth",
        "quantity": 20
      },
      {
        "name": "Chultan Silk",
        "quantity": 10
      },
      {
        "name": "Gold Wire",
        "quantity": 6
      },
      {
        "name": "Vermilion Fabric Dye",
        "quantity": 4
      }
    ],
    "sourceUrl": "https://neverwinter.fandom.com/wiki/Masterwork_Tailoring"
  }
]
