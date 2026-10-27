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
