import { expect, test } from '@playwright/test'

const routes = [
  ['/catalog', 'catalog'],
  ['/plan', 'plan'],
  ['/materials', 'materials'],
  ['/reference', 'reference'],
  ['/journey', 'progression'],
  ['/readiness', 'readiness'],
  ['/explore', 'explorer'],
  ['/graph', 'recipe-graph'],
  ['/data-health', 'data-health'],
] as const

for (const [path, name] of routes) {
  test('V4 preserves route ' + name + ' with branded dark surfaces', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(path)
    await expect(page.locator('.forge-desktop-topbar')).toBeVisible()
    await expect(page.locator('.forge-desktop-brand')).toContainText('MASTERWORK')
    const background = await page.locator('body').evaluate((node) => getComputedStyle(node).backgroundColor)
    expect(background).toBe('rgb(11, 13, 18)')
    const horizontal = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(horizontal, 'Document-level horizontal overflow on ' + name).toBeLessThanOrEqual(1)
    await page.screenshot({ path: testInfo.outputPath('forge-workbench-' + name + '-desktop.png'), fullPage: false })
  })
}
