import { expect, test } from '@playwright/test'

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`workspace utilities occupy navigation chrome, not recipe content, at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/journey')
    const search = page.getByRole('button', { name: 'Open universal search', exact: true })
    const density = page.locator('.ux-density-menu > summary')
    await expect(search).toBeVisible()
    await expect(density).toBeVisible()
    for (const control of [search, density]) {
      const box = await control.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
      if (width <= 680 || width > 1180) expect(box!.y + box!.height).toBeLessThanOrEqual(72)
      else {
        const rail = await page.getByRole('complementary', { name: 'Workspace navigation' }).boundingBox()
        expect(box!.x + box!.width).toBeLessThanOrEqual(rail!.x + rail!.width)
      }
    }
    const targets = page.locator('.mobile-v4-topbar a, .workspace-tools-menu > summary, .ux-density-menu > summary, .mw-command-launcher, .journey-page-topbar a').filter({ visible: true })
    const boxes = await targets.evaluateAll((nodes) => nodes.map((node) => { const r = node.getBoundingClientRect(); return { text: node.textContent, x: r.x, y: r.y, right: r.right, bottom: r.bottom } }))
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j]
      const intersection = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y))
      expect(intersection, `${a.text} overlaps ${b.text}`).toBe(0)
    }
    await search.click()
    await expect(page.getByRole('dialog', { name: 'Search the entire Vault' })).toBeVisible()
    await page.keyboard.press('Escape')
    await density.click()
    await expect(page.getByRole('button', { name: /Summary Core crafting decisions only/ })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath(`workspace-utilities-${width}.png`) })
  })
}
