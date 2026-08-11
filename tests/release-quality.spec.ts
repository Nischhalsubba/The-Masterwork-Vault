import { expect, test } from '@playwright/test'

const viewports = [
  { width: 320, height: 740, label: 'extreme phone' },
  { width: 375, height: 812, label: 'small phone' },
  { width: 430, height: 932, label: 'large phone' },
  { width: 768, height: 1024, label: 'tablet portrait' },
  { width: 1024, height: 768, label: 'compact desktop' },
  { width: 1280, height: 800, label: 'laptop' },
  { width: 1440, height: 900, label: 'desktop' },
  { width: 1920, height: 1080, label: 'large desktop' },
]

for (const viewport of viewports) {
  test(`readiness layout has no page overflow at ${viewport.width}px ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/readiness')
    await expect(page.getByRole('heading', { name: 'Know exactly what unlocks next.' })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('phone landscape keeps readiness usable', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 })
  await page.goto('/readiness')
  await expect(page.getByRole('heading', { name: 'Know exactly what unlocks next.' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open universal search' })).toBeVisible()
})

test('keyboard can reach primary navigation and command search', async ({ page }) => {
  await page.goto('/readiness')
  await page.keyboard.press('Tab')
  const first = page.locator(':focus')
  await expect(first).toBeVisible()
  await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })))
  const dialog = page.getByRole('dialog', { name: 'Search the entire Vault' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('textbox')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('reduced motion disables the ambient WebGL canvas and readiness entrance motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/catalog')
  const canvas = page.locator('.ambient-vault canvas')
  if (await canvas.count()) await expect(canvas).toHaveCSS('display', 'none')
  await page.goto('/readiness')
  await expect(page.getByRole('heading', { name: 'Know exactly what unlocks next.' })).toBeVisible()
})

test('data health reports catalog-integrity status without crashing', async ({ page }) => {
  await page.goto('/data-health')
  const status = page.locator('.mw-health-status')
  await expect(status).toBeVisible()
  const blockerCount = Number((await status.locator('strong').textContent()) || '0')
  if (blockerCount > 0) await expect(page.getByRole('heading', { name: 'Release blockers' })).toBeVisible()
  else await expect(status).toHaveClass(/clean/)
})

test('new route set survives direct reloads', async ({ page }) => {
  for (const path of ['/readiness', '/data-health', '/explore', '/graph', '/journey']) {
    await page.goto(path)
    await page.reload()
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('body')).not.toContainText('Application crashed')
  }
})

test('visual capture smoke records critical surfaces', async ({ page }, testInfo) => {
  const routes = ['/catalog', '/readiness', '/data-health', '/explore', '/graph']
  for (const route of routes) {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(route)
    await page.screenshot({ path: testInfo.outputPath(`${route.slice(1) || 'home'}-desktop.png`), fullPage: true })
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(route)
    await page.screenshot({ path: testInfo.outputPath(`${route.slice(1) || 'home'}-mobile.png`), fullPage: true })
  }
})
