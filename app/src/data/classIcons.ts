export const NW_HUB_CLASSES_SOURCE = 'https://nw-hub.com/classes'

export const nwHubClassIcons: Record<string, string> = {
  Fighter: 'https://nw-hub.com/assets/classes/emblems/fighter.webp',
  Barbarian: 'https://nw-hub.com/assets/classes/emblems/barbarian.webp',
  Paladin: 'https://nw-hub.com/assets/classes/emblems/paladin.webp',
  Cleric: 'https://nw-hub.com/assets/classes/emblems/cleric.webp',
  Wizard: 'https://nw-hub.com/assets/classes/emblems/wizard.webp',
  Warlock: 'https://nw-hub.com/assets/classes/emblems/warlock.webp',
  Rogue: 'https://nw-hub.com/assets/classes/emblems/rogue.webp',
  Ranger: 'https://nw-hub.com/assets/classes/emblems/ranger.webp',
  Bard: 'https://nw-hub.com/assets/classes/emblems/bard.webp',
}

export const classIconSource = (className: string) => nwHubClassIcons[className] ?? null
