import { expect, test } from '@playwright/test'

const routes = ['catalog', 'materials', 'plan', 'reference', 'journey', 'readiness', 'explore', 'graph', 'data-health']
for (const width of [320, 390, 768, 1024, 1440]) {
  test(`workspace reflows without clipped primary content at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'phone', 'Explicit viewport matrix is run once, in the desktop project')
    test.setTimeout(120_000)
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const reports: unknown[] = []
    for (const route of routes) {
      await page.goto(`/${route}`)
      await expect(page.getByRole('main')).toBeVisible()
      await page.waitForLoadState('networkidle')
      const report = await page.evaluate(() => {
        const width = window.innerWidth
        const main = document.querySelector('main')!
        const overflowing = [...main.querySelectorAll<HTMLElement>('*')].filter((element) => {
          const rect = element.getBoundingClientRect()
          if (!element.getClientRects().length || getComputedStyle(element).visibility === 'hidden') return false
          if (rect.right <= width + 1 && rect.left >= -1) return false
          if (element.closest('.sprite, .atlas-icon, .stats-drawer-layer:not(.open), [aria-hidden="true"]')) return false
          let ancestor = element.parentElement
          while (ancestor && ancestor !== main) {
            if (['auto', 'scroll'].includes(getComputedStyle(ancestor).overflowX)) return false
            ancestor = ancestor.parentElement
          }
          return rect.width > 0
        }).map((element) => ({ tag: element.tagName, className: element.className, text: element.textContent?.slice(0, 70), bounds: element.getBoundingClientRect().toJSON() }))
        return { width, documentWidth: document.documentElement.scrollWidth, main: main.getBoundingClientRect().toJSON(), overflowing }
      })
      reports.push({ route, ...report })
      await page.screenshot({ path: testInfo.outputPath(`workspace-${route}-${width}.png`), fullPage: true })
      expect.soft(report.documentWidth, `${route}: document overflows`).toBeLessThanOrEqual(width + 1)
      expect.soft(report.main.right, `${route}: main extends past viewport`).toBeLessThanOrEqual(width + 1)
      expect.soft(report.overflowing, `${route}: content clipped outside the viewport`).toEqual([])
    }
    await testInfo.attach('workspace-layout-report', { body: JSON.stringify(reports, null, 2), contentType: 'application/json' })
  })
}
