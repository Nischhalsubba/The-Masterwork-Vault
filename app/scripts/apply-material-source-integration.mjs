import { readFile, writeFile } from 'node:fs/promises'

// Match the project's existing prebuild integration approach, fail closed on source drift,
// and keep this pass idempotent for build, dev and repeated quality runs.
async function patch(path, edits, importLine) {
  const url = new URL(path, import.meta.url)
  let source = await readFile(url, 'utf8')
  for (const [from, to] of edits) {
    if (source.includes(to)) continue
    if (!source.includes(from) || source.split(from).length !== 2) throw new Error(`Material sources: expected one integration anchor in ${path}: ${from.slice(0, 90)}`)
    source = source.replace(from, to)
  }
  if (!source.includes(importLine)) source = importLine + '\n' + source
  await writeFile(url, source)
}
await patch('../src/App.tsx', [
  ['<b>\u00d7{r.required}</b>', '<b>\u00d7{r.required}</b>{!material?.craftable && <MaterialSourceButton name={r.name} />}'],
], "import { MaterialSourceButton } from './components/MaterialSources'")
await patch('../src/components/CraftingWorkbench.tsx', [
  ['<div className="recipe-row-actions"><b>\u00d7{row.required}</b>', '<div className="recipe-row-actions"><b>\u00d7{row.required}</b>{!material?.craftable && <MaterialSourceButton name={row.name} />}'],
  ['<div className="tree-quantity"><span>', "{node.kind === 'material' && !node.craftable && <MaterialSourceButton name={node.name} />}<div className=\"tree-quantity\"><span>"],
  ['<details className="evidence-card" open={Boolean(recipe)}>', '<>{!material.craftable && !recipe && <MaterialSourcePanel name={material.name} />}</><details className="evidence-card" open={Boolean(recipe)}>'],
  ['<section className="panel materials-browser">', '<section className="panel materials-browser"><MaterialSourceBrowser names={catalog.materials.filter((row) => !row.craftable && !recipeByName.has(norm(row.name))).map((row) => row.name)} />'],
  ['<div className="shopping-list">{shoppingRows.map((row) => <label', '<div className="shopping-list">{shoppingRows.map((row) => <div className="shopping-acquisition-row" key={row.name}><label'],
  ['<b>Acquire \u00d7{row.missing}</b></label>)}</div>', '<b>Acquire \u00d7{row.missing}</b></label><MaterialSourceButton name={row.name} /></div>)}</div>'],
], "import { MaterialSourceButton, MaterialSourcePanel, MaterialSourceBrowser } from './MaterialSources'")
console.log('Material acquisition guides integrated into recipes, raw dependency nodes, Materials and the farming checklist.')
