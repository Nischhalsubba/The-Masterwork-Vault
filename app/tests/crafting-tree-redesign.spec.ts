import { test, expect } from '@playwright/test'

async function addFeywoodBroadSlab(page) {
  await page.goto('/catalog?campaign=Sharandar&q=Feywood%20Broad%20Slab')
  const card = page.locator('.catalog .items article').filter({ hasText: 'Feywood Broad Slab' }).first()
  await expect(card).toBeVisible()
  const add = card.locator('.item-foot > button')
  await expect(add).toBeVisible()
  await add.click()
  await page.goto('/plan')
}

test('approved coded crafting-tree layout is used in Plan & Craft', async ({ page }) => {
  await addFeywoodBroadSlab(page)
  await page.getByRole('tab', { name: 'Craft tree' }).click()

  const shell = page.locator('.masterwork-tree-shell')
  await expect(shell).toBeVisible()
  await expect(shell.getByRole('link', { name: 'The Masterwork Vault home' })).toBeVisible()
  await expect(shell.getByRole('button', { name: 'Plan & Craft' })).toHaveAttribute('aria-current', 'page')

  await expect(shell.getByRole('heading', { name: 'Crafting Tree', level: 1 })).toBeVisible()
  await expect(shell).toContainText('See the full dependency chain for your item.')
  await expect(shell.getByRole('button', { name: 'Item Tree' })).toHaveAttribute('aria-pressed', 'true')
  await expect(shell.getByRole('button', { name: 'Material Tree' })).toHaveAttribute('aria-pressed', 'false')

  const root = shell.locator('.masterwork-graph-node.root')
  await expect(root).toContainText('Feywood Broad Slab')
  await expect(root.locator('img, .atlas-icon, .sprite')).not.toHaveCount(0)

  for (const name of ["Dawn's Silver Enamel", 'Hardened Feywood', "Displacer Beast's Whisker", "Frozen Dawn's Dew"]) {
    await expect(shell.locator('.masterwork-graph-node').filter({ hasText: name }).first()).toBeVisible()
  }

  await expect.poll(async () => shell.locator('.masterwork-tree-connectors path').count()).toBeGreaterThan(0)

  for (const label of ['Crafted material', 'Raw material', 'Gathered', 'Dungeon drop', 'Vendor / Other']) {
    await expect(shell.getByText(label, { exact: true })).toBeVisible()
  }

  const fit = shell.getByRole('button', { name: 'Fit to view' })
  await fit.click()
  await expect(shell.getByRole('button', { name: 'Reset view' })).toBeVisible()
})

test('material tree mode re-roots the approved graph on a craftable material', async ({ page }) => {
  await addFeywoodBroadSlab(page)
  await page.getByRole('tab', { name: 'Craft tree' }).click()

  const shell = page.locator('.masterwork-tree-shell')
  await shell.getByRole('button', { name: 'Material Tree' }).click()
  await expect(shell.getByRole('button', { name: 'Material Tree' })).toHaveAttribute('aria-pressed', 'true')
  await expect(shell.locator('.masterwork-graph-node.root')).toContainText("Dawn's Silver Enamel")
  await expect(shell).toContainText('Material')
})

test('approved crafting tree stays usable on phone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Phone-only layout assertion')
  await addFeywoodBroadSlab(page)
  await page.getByRole('tab', { name: 'Craft tree' }).click()

  const shell = page.locator('.masterwork-tree-shell')
  await expect(shell).toBeVisible()
  await expect(shell.locator('.masterwork-tree-sidebar')).toBeVisible()

  const stage = shell.locator('.masterwork-tree-stage')
  await expect(stage).toBeVisible()
  expect(await stage.evaluate((node) => node.scrollWidth >= node.clientWidth)).toBe(true)

  const firstNode = shell.locator('.masterwork-graph-node').first()
  const box = await firstNode.boundingBox()
  expect(box?.width || 0).toBeGreaterThanOrEqual(72)
})
