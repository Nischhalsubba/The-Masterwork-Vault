import { expect, test } from '@playwright/test'

const missingMaterials = ['Umber Hulk Mandible', 'Myrrh', 'Volcanic Salt', 'Wild Mint', 'Marilith Hair', 'Lacquered Roth\u00e8 Leather']

test('every previously dangling ingredient has a reachable Materials record', async ({ page }) => {
  await page.goto('/materials')
  const search = page.getByRole('textbox', { name: 'Search materials', exact: true })
  for (const name of missingMaterials) {
    await search.fill(name)
    const row = page.locator('.material-list > button').filter({ hasText: name }).first()
    await expect(row).toBeVisible()
    await row.click()
    await expect(page.getByRole('heading', { name: `Where to get ${name}`, exact: true })).toBeVisible()
  }
  await expect(page.locator('.material-intelligence .acquisition-guide')).toContainText('Needs verification')
  await expect(page.locator('.material-intelligence .acquisition-route')).toHaveCount(0)
})

test('material reference completion leaves no dangling references in Data Health', async ({ page }) => {
  await page.goto('/data-health')
  await expect(page.getByRole('main')).not.toContainText('Dangling material reference:')
})
