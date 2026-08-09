const fandomFile = (fileName: string) =>
  `https://neverwinter.fandom.com/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}`

const gatheringMaterialIconOverrides: Record<string, string> = {
  'sugar-beet': fandomFile('Crafting_Resource_Sugarbeat.png'),
  'aberrant-blood': fandomFile('Crafting_Resource_Aberrantblood.png'),
  'aberrant-bone': fandomFile('Crafting_Resource_Bone_Aberrant.png'),
  'chamomile': fandomFile('Crafting_Resource_Chamomile.png'),
  'beast-horn': fandomFile('Crafting_Resource_Beasthorn.png'),
}

export default gatheringMaterialIconOverrides
