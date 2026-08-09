const gatheringIcon = (fileName: string) =>
  `/media/neverwinter/${encodeURIComponent(fileName)}`

const gatheringMaterialIconOverrides: Record<string, string> = {
  'sugar-beet': gatheringIcon('Crafting_Resource_Sugarbeat.png'),
  'aberrant-blood': gatheringIcon('Crafting_Resource_Aberrantblood.png'),
  'aberrant-bone': gatheringIcon('Crafting_Resource_Bone_Aberrant.png'),
  'chamomile': gatheringIcon('Crafting_Resource_Chamomile.png'),
  'beast-horn': gatheringIcon('Crafting_Resource_Beasthorn.png'),
}

export default gatheringMaterialIconOverrides
