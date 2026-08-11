import { expect, test } from '@playwright/test'

test('readiness tracks seven professions and survives reload', async ({ page }) => {
  await page.goto('/readiness')
  await expect(page.getByRole('heading', { name: 'Know exactly what unlocks next.' })).toBeVisible()
  await expect(page.locator('.mw-profession-table tbody tr')).toHaveCount(7)
  const alchemy = page.locator('.mw-profession-table tbody tr').filter({ hasText: 'Alchemy' })
  await alchemy.getByRole('spinbutton').fill('20')
  await alchemy.getByRole('button', { name: 'Chultan I for Alchemy' }).click()
  await page.reload()
  await expect(alchemy.getByRole('spinbutton')).toHaveValue('20')
  await expect(alchemy.getByRole('button', { name: 'Chultan I for Alchemy' })).toHaveAttribute('aria-pressed', 'true')
})

test('universal search opens from keyboard and finds progression', async ({ page }) => {
  await page.goto('/catalog')
  await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })))
  await expect(page.getByRole('dialog', { name: 'Search the entire Vault' })).toBeVisible()
  await page.getByPlaceholder(/Try/).fill('Sharandar')
  await expect(page.getByRole('option').filter({ hasText: 'Masterwork Journey' }).or(page.getByRole('option').filter({ hasText: 'Sharandar' })).first()).toBeVisible()
})

test('data health exposes reverification queues', async ({ page }) => {
  await page.goto('/data-health')
  await expect(page.getByRole('heading', { name: 'Data health and reverification.' })).toBeVisible()
  await expect(page.getByText('Unknown output yields')).toBeVisible()
  await expect(page.getByText('Artwork provenance')).toBeVisible()
  await expect(page.getByText('Verification ledger')).toBeVisible()
})

test('readiness remains usable at small phone width', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/readiness')
  await expect(page.getByRole('heading', { name: 'Know exactly what unlocks next.' })).toBeVisible()
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll')
  await expect(page.getByRole('button', { name: 'Open universal search' })).toBeVisible()
})

test('readiness direct route reloads through SPA fallback', async ({ page }) => {
  await page.goto('/readiness')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Know exactly what unlocks next.' })).toBeVisible()
})
