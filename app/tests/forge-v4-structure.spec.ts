import { expect, test } from '@playwright/test'

test('Forge V4 catalog exposes the real three-pane workbench and dark surfaces', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1600, height: 940 })
  await page.goto('/catalog')
  await expect(page.getByRole('heading', { name: /The forge workbench/i })).toBeVisible()
  await expect(page.locator('.forge-desktop-topbar')).toBeVisible()
  await expect(page.locator('.forge-work-order')).toBeVisible()
  await expect(page.locator('.forge-production-route')).toBeVisible()
  await expect(page.locator('.items article').first()).toBeVisible()
  await expect(page.locator('.catalog .result-meta')).toHaveCSS('background-color', 'rgb(32, 33, 42)')
  await expect(page.locator('.catalog .item-foot').first()).toHaveCSS('background-color', 'rgb(23, 25, 32)')
  const panes = await page.locator('.catalog .split').evaluate((node) => {
    const style = getComputedStyle(node)
    const children = [node.querySelector('.items'), node.querySelector('.detail'), node.querySelector('.forge-work-order')].map((child) => child!.getBoundingClientRect())
    return { columns: style.gridTemplateColumns.split(' ').length, x: children.map((box) => box.x) }
  })
  expect(panes.columns).toBe(3)
  expect(panes.x[0]).toBeLessThan(panes.x[1])
  expect(panes.x[1]).toBeLessThan(panes.x[2])
  await page.screenshot({ path: testInfo.outputPath('forge-workbench-desktop.png'), fullPage: true })
})

test('Forge V4 work order recalculates quantity and keeps existing source catalog intact', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 940 })
  await page.goto('/catalog')
  const order = page.locator('.forge-work-order')
  await expect(order.getByRole('button', { name: 'Add to crafting plan' })).toBeEnabled()
  await expect(order.locator('output[aria-label="Craft quantity"]')).toHaveText('1')
  await order.getByRole('button', { name: 'Increase craft quantity' }).click()
  await expect(order.locator('output[aria-label="Craft quantity"]')).toHaveText('2')
  await order.getByRole('button', { name: 'Add to crafting plan' }).click()
  await expect(order.getByRole('button', { name: 'Update crafting plan' })).toBeVisible()
  await order.getByRole('button', { name: 'Open complete plan' }).click()
  await expect(page.getByRole('main')).toContainText('Plan')
})

test('Forge V4 mobile retains original navigation and dark list surfaces', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/catalog')
  await expect(page.locator('.forge-desktop-topbar')).toBeHidden()
  await expect(page.locator('.mobile-v4-topbar')).toBeVisible()
  await expect(page.locator('.catalog .result-meta')).toHaveCSS('background-color', 'rgb(32, 33, 42)')
  await expect(page.locator('.catalog .item-foot').first()).toHaveCSS('background-color', 'rgb(23, 25, 32)')
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await page.screenshot({ path: testInfo.outputPath('forge-workbench-mobile.png'), fullPage: true })
})
