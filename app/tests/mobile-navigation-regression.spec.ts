import { expect, test } from '@playwright/test'

// These checks exercise the real mobile surfaces, not just document scrollWidth.
test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('mobile utility controls do not overlap each other', async ({ page }) => {
  await page.goto('/catalog')
  const compare = page.getByRole('button', { name: 'Compare items', exact: true })
  const density = page.locator('.ux-density-menu > summary')
  await expect(compare).toBeVisible()
  await expect(density).toBeVisible()
  const a = (await compare.boundingBox())!
  const b = (await density.boundingBox())!
  const overlap = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  expect(overlap).toBe(0)
})

test('selecting a material reveals its detail rather than leaving it below the picker', async ({ page }) => {
  await page.goto('/materials')
  await page.locator('.material-list > button').filter({ hasText: 'Mushroom Log' }).click()
  const heading = page.locator('.material-intelligence h2').first()
  await expect(heading).toHaveText('Mushroom Log')
  await expect(heading).toBeInViewport()
})

for (const route of ['journey', 'readiness', 'explore', 'graph', 'data-health']) {
  test(`mobile navigation remains available on ${route}`, async ({ page }) => {
    await page.goto(`/${route}`)
    const navigation = page.locator('.mobile-v4-tabbar')
    await expect(navigation).toBeVisible()
    await expect(navigation.getByRole('button', { name: 'Materials', exact: true })).toBeVisible()
    await navigation.getByRole('button', { name: 'Materials', exact: true }).click()
    await expect(page).toHaveURL(/\/materials$/)
    await expect(page.getByRole('textbox', { name: 'Search materials', exact: true })).toBeVisible()
  })
}
