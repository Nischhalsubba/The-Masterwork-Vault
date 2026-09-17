import { expect, test, type Page } from '@playwright/test'

async function openIndex(page: Page) {
  await page.goto('/materials')
  await page.getByRole('button', { name: /Browse material sources/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Material acquisition guide', exact: true })
  await expect(dialog).toBeVisible()
  return dialog
}

test('source search recognizes natural spelling aliases', async ({ page }) => {
  const dialog = await openIndex(page)
  await dialog.getByLabel('Find a material, location or method').fill('Duergarsteel Scrap')
  await expect(dialog.locator('.acquisition-index > details')).toHaveCount(1)
  await expect(dialog.locator('.acquisition-index > details > summary')).toContainText('Druegarsteel Scrap')
})

test('source search finds the named hunt modifier', async ({ page }) => {
  const dialog = await openIndex(page)
  await dialog.getByLabel('Find a material, location or method').fill('Tricky Reversal')
  await expect(dialog.locator('.acquisition-index > details')).toHaveCount(3)
  await expect(dialog.locator('.acquisition-index > details > summary').filter({ hasText: 'Mushroom Droplet' })).toHaveCount(1)
})

test('collapsed source index defers detailed guide rendering', async ({ page }) => {
  const dialog = await openIndex(page)
  await expect(dialog.locator('.acquisition-index > details')).toHaveCount(44)
  await expect(dialog.locator('.acquisition-index .acquisition-guide')).toHaveCount(0)
  await dialog.getByLabel('Find a material, location or method').fill('Mushroom Log')
  await dialog.locator('.acquisition-index > details > summary').click()
  await expect(dialog.locator('.acquisition-index .acquisition-guide')).toHaveCount(1)
})
