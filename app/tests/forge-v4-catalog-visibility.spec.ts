import { expect, test } from '@playwright/test'

test('catalog formula archive preserves readable list rows and separated controls', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1728, height: 900 })
  await page.goto('/catalog')
  const browser = page.locator('.forge-formula-browser')
  const metrics = await browser.evaluate((node) => {
    const find = (selector: string) => node.querySelector<HTMLElement>(selector)!.getBoundingClientRect()
    const collection = find('.collection-switcher')
    const classes = find('.mw-class-filter')
    const toolbar = find('.toolbar')
    const list = find('.items')
    const selected = find('.items article.selected')
    const selectedMain = find('.items article.selected .item-main')
    const selectedTitle = find('.items article.selected .item-main strong')
    return {
      collectionBottom: collection.bottom,
      classTop: classes.top,
      classBottom: classes.bottom,
      toolbarTop: toolbar.top,
      toolbarBottom: toolbar.bottom,
      listTop: list.top,
      selectedHeight: selected.height,
      mainHeight: selectedMain.height,
      titleHeight: selectedTitle.height,
      listDisplay: getComputedStyle(node.querySelector('.items')!).display,
      listScroll: getComputedStyle(node.querySelector('.items')!).overflowY,
    }
  })
  expect(metrics.classTop).toBeGreaterThanOrEqual(metrics.collectionBottom - 1)
  expect(metrics.toolbarTop).toBeGreaterThanOrEqual(metrics.classBottom - 1)
  expect(metrics.listTop).toBeGreaterThanOrEqual(metrics.toolbarBottom - 1)
  expect(metrics.toolbarBottom - metrics.toolbarTop).toBeLessThanOrEqual(150)
  expect(metrics.listTop).toBeLessThan(770)
  expect(metrics.selectedHeight).toBeGreaterThanOrEqual(80)
  expect(metrics.mainHeight).toBeGreaterThanOrEqual(55)
  expect(metrics.titleHeight).toBeGreaterThanOrEqual(12)
  expect(metrics.listDisplay).toBe('block')
  expect(metrics.listScroll).toBe('auto')
  await expect(page.locator('.items article.selected .item-main strong')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('forge-catalog-readable-desktop.png'), fullPage: false })
})

test('work-order actions are available without scrolling inside the inspector', async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 900 })
  await page.goto('/catalog')
  const aside = page.locator('.forge-work-order')
  await expect(aside).toBeVisible()
  const metrics = await aside.evaluate((node) => {
    const sheet = node.querySelector<HTMLElement>('.forge-order-body')!
    const buttons = node.querySelector<HTMLElement>('.forge-order-actions')!
    return {
      sheetOverflow: getComputedStyle(sheet).overflowY,
      buttonBottom: buttons.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
    }
  })
  expect(metrics.sheetOverflow).toBe('auto')
  expect(metrics.buttonBottom).toBeLessThanOrEqual(metrics.viewportHeight + 2)
})

test('phone catalogue list keeps full item rows and no document overflow', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/catalog')
  await expect(page.locator('.forge-formula-browser .items article').first()).toBeVisible()
  const heights = await page.locator('.forge-formula-browser .items article').first().evaluate(node => ({
    row: node.getBoundingClientRect().height,
    title: node.querySelector('strong')!.getBoundingClientRect().height,
  }))
  expect(heights.row).toBeGreaterThanOrEqual(75)
  expect(heights.title).toBeGreaterThan(10)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await page.screenshot({ path: testInfo.outputPath('forge-catalog-readable-mobile.png'), fullPage: false })
})

test('desktop utility buttons occupy the navigation region without covering the work order', async ({ page }) => {
  await page.setViewportSize({ width: 1728, height: 900 })
  await page.goto('/catalog')
  const search = page.getByRole('button', { name: 'Open universal search', exact: true })
  const density = page.locator('.ux-density-menu > summary')
  const more = page.locator('.forge-desktop-tools > summary')
  await expect(search).toBeVisible()
  await expect(density).toBeVisible()
  await expect(more).toBeVisible()
  const rects = await Promise.all([search, density, more].map(locator => locator.boundingBox()))
  for (const rect of rects) {
    expect(rect).not.toBeNull()
    expect(rect!.y).toBeLessThan(80)
    expect((rect!.y + rect!.height)).toBeLessThanOrEqual(80)
  }
  const intersection = (a: NonNullable<typeof rects[0]>, b: NonNullable<typeof rects[0]>) =>
    Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
    Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  expect(intersection(rects[0]!, rects[1]!)).toBe(0)
  expect(intersection(rects[1]!, rects[2]!)).toBe(0)
})

test('zero-result search shows a real empty state and no fake recipe panel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/catalog')
  await page.getByRole('textbox', { name: 'Search catalog' }).fill('definitely-not-a-real-masterwork-item-xyz')
  await expect(page.getByRole('heading', { name: 'No craftables match' })).toBeVisible()
  await expect(page.locator('.catalog .detail').filter({ visible: true })).toHaveCount(0)
})
