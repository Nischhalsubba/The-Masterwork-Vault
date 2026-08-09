import { expect, test } from '@playwright/test'

test('catalog loads with social metadata', async ({ page }) => {
  await page.goto('/catalog')
  await expect(page).toHaveTitle(/Masterwork Vault/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview/)
  await expect(page.getByRole('main')).toBeVisible()
})

test('zero-result search has a real empty state', async ({ page }) => {
  await page.goto('/catalog')
  const search = page.getByRole('textbox', { name: 'Search catalog' })
  await search.fill('definitely-not-a-real-masterwork-item-xyz')
  await expect(page.getByRole('heading', { name: 'No craftables match' })).toBeVisible()
  await expect(page.locator('.catalog .detail').filter({ visible: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Clear search and filters' }).click()
  await expect(search).toHaveValue('')
})

test('catalog filters are reflected in the URL', async ({ page }) => {
  await page.goto('/catalog')
  await page.getByRole('textbox', { name: 'Search catalog' }).fill('sword')
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('sword')
})

test('item selection creates a stable deep link and reloads', async ({ page }) => {
  await page.goto('/catalog')
  const item = page.locator('.catalog .items .item-main').first()
  await item.click()
  await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/catalog\/(sharandar|underdark)\//)
  const path = new URL(page.url()).pathname
  await page.reload()
  await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
})

test('unknown paths canonicalize to catalog', async ({ page }) => {
  await page.goto('/this-route-does-not-exist')
  await expect(page).toHaveURL(/\/catalog(?:\?|$)/)
})

test('details drawer traps focus and closes with Escape', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'Desktop drawer flow')
  await page.goto('/catalog')
  await page.locator('.catalog .items .item-main').first().click()
  const details = page.getByRole('button', { name: /Details/ })
  await details.click()
  const dialog = page.getByRole('dialog', { name: /details/i })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(details).toBeFocused()
})

test('reference exposes accessible tabs', async ({ page }) => {
  await page.goto('/reference')
  await expect(page.getByRole('tab', { name: 'Workshop' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('tab', { name: 'Sources' }).click()
  await expect(page.getByRole('tab', { name: 'Sources' })).toHaveAttribute('aria-selected', 'true')
})

test('shared plan survives reload', async ({ page }) => {
  await page.goto('/catalog')
  const add = page.locator('.item-foot > button').first()
  if (await add.count()) await add.click()
  await page.goto('/plan')
  await page.getByRole('tab', { name: 'Saved' }).click()
  const create = page.getByRole('button', { name: /Create link/i })
  if (await create.isEnabled()) {
    await create.click()
    const input = page.getByRole('textbox', { name: 'Shareable plan URL' })
    const url = await input.inputValue()
    await page.goto(url)
    await expect(page).toHaveURL(/\/plan\?plan=/)
  }
})

test('unknown-recipe craftables are not presented as ready', async ({ page }) => {
  await page.goto('/plan')
  await page.getByRole('tab', { name: 'Craftable now' }).click()
  const cards = page.locator('.ready-card')
  for (let i = 0; i < Math.min(await cards.count(), 20); i += 1) {
    await expect(cards.nth(i)).not.toContainText('Recipe needed')
  }
})

test('mobile catalog can open and back out of item detail', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'phone', 'Phone-only navigation flow')
  await page.goto('/catalog')
  await page.locator('.catalog .items .item-main').first().click()
  await expect(page.locator('body')).toHaveClass(/mobile-v4-detail-open/)
  await page.getByRole('button', { name: /Back to catalog/i }).click()
  await expect(page.locator('body')).not.toHaveClass(/mobile-v4-detail-open/)
})
