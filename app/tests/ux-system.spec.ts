import { expect, test } from '@playwright/test'

test('information density is user-selectable and persists', async ({ page }) => {
  await page.goto('/catalog')
  await page.locator('.ux-density-menu > summary').click()
  await page.getByRole('button', { name: /Summary Core crafting decisions only/ }).click()
  await expect(page.locator('html')).toHaveAttribute('data-information-density', 'summary')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-information-density', 'summary')
})

test('catalog keeps filter state through item routes and exposes plan feedback', async ({ page }) => {
  await page.goto('/catalog?campaign=All&q=Masterwork')
  const search = page.getByRole('textbox', { name: 'Search catalog' })
  await expect(search).toHaveValue('Masterwork')
  await expect(page).toHaveURL(/campaign=All/)

  const itemButton = page.locator('.item-main').first()
  await expect(itemButton).toBeVisible()
  await itemButton.click()
  await expect(page).toHaveURL(/\/catalog\/(sharandar|underdark)\//)
  await expect(page).toHaveURL(/q=Masterwork/)
  await page.goBack()
  await expect(search).toHaveValue('Masterwork')

  await search.fill('')
  const planButton = page.locator('.item-foot button').first()
  await expect(planButton).toBeVisible()
  await planButton.click()
  const toast = page.locator('.ux-action-toast.visible')
  await expect(toast).toContainText(/plan/i)
  await toast.getByRole('button', { name: /Open plan/ }).click()
  await expect(page).toHaveURL(/\/plan(?:\?|$)/)
})

test('advanced explorer hydrates and writes shareable filter state', async ({ page }) => {
  await page.goto('/explore?q=Masterwork&campaign=Sharandar&recipe=captured')
  const search = page.getByPlaceholder('Search item, material, class…')
  await expect(search).toHaveValue('Masterwork')
  await expect(page.getByRole('checkbox', { name: 'Sharandar' })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Recipe captured' })).toBeChecked()

  await search.fill('Potion')
  await search.press('Enter')
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('Potion')
  await search.fill('')
  await expect(page.getByRole('button', { name: 'Potion' })).toBeVisible()
  await page.getByRole('button', { name: 'Potion' }).click()
  await expect(search).toHaveValue('Potion')
})

test('large-result surfaces use progressive rendering and static hero effects', async ({ page }) => {
  await page.goto('/explore')
  const resultCount = await page.locator('.mw-explore-count strong').innerText()
  const total = Number(resultCount.replace(/[^0-9]/g, ''))
  const rendered = await page.locator('.mw-explore-card').count()
  expect(rendered).toBeLessThanOrEqual(60)
  if (total > 60) await expect(page.locator('.mw-progressive-sentinel')).toBeVisible()

  await page.goto('/catalog')
  await expect(page.locator('.ambient-vault')).toHaveCount(1)
  await expect(page.locator('.ambient-vault canvas')).toHaveCount(0)
  await expect(page.locator('.ambient-vault-static')).toHaveCount(1)
})

test('comparison explains compatibility, best values, and differences-only mode', async ({ page }) => {
  await page.goto('/catalog')
  await page.getByRole('button', { name: /Compare items/ }).click()
  const picker = page.locator('.mw-compare-picker > button')
  await expect(picker.first()).toBeVisible()
  await picker.nth(0).click()
  await picker.nth(1).click()

  await expect(page.locator('.mw-compatibility-note')).toBeVisible()
  await expect(page.locator('.mw-compare-legend')).toContainText('Best')
  const differences = page.getByRole('checkbox', { name: 'Differences only' })
  await differences.check()
  await expect(differences).toBeChecked()
  await expect(page.locator('.compare-table:visible, .mw-compare-mobile:visible').first()).toBeVisible()
})

test('readiness presents ranked actions and mobile-native profession cards', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/readiness')
  await expect(page.getByRole('heading', { name: 'What should I work on next?' })).toBeVisible()
  await expect(page.locator('.mw-priority-list > li')).toHaveCount(5)
  await expect(page.locator('.mw-profession-cards > article')).toHaveCount(7)
  await expect(page.locator('.mw-profession-cards')).toBeVisible()
  await expect(page.locator('.mw-profession-table-wrap')).toBeHidden()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('data health becomes a card ledger on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/data-health')
  await expect(page.getByRole('heading', { name: 'Data health and reverification.' })).toBeVisible()
  await expect(page.locator('.mw-ledger tbody tr').first()).toBeVisible()
  const display = await page.locator('.mw-ledger tbody tr').first().evaluate((node) => getComputedStyle(node).display)
  expect(display).toBe('block')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('global skip link is the first keyboard escape route', async ({ page }) => {
  await page.goto('/explore')
  const skip = page.locator('.ux-skip-link')
  await expect(skip).toBeAttached()
  await page.keyboard.press('Tab')
  await sskip.toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
})
