import { test, expect } from '@playwright/test'

test.describe('purposeful app-wide redesign', () => {
  test('desktop uses one persistent workspace navigation across catalog and progression', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/catalog')

    const sidebar = page.locator('.tablet-v4-sidebar')
    await expect(sidebar).toBeVisible()
    for (const label of ['Catalog', 'Plan & Craft', 'Materials', 'Progression', 'Reference']) {
      await expect(sidebar.getByRole('link', { name: label }).or(sidebar.getByRole('button', { name: label }))).toBeVisible()
    }

    await expect(page.locator('.app > header')).toBeHidden()
    await expect(page.locator('.hero')).toBeHidden()

    await sidebar.getByRole('link', { name: 'Progression' }).click()
    await expect(page).toHaveURL(/\/journey$/)
    await expect(page.locator('.tablet-v4-sidebar')).toBeVisible()
    await expect(page.locator('.mw-page-topbar')).toBeHidden()
  })

  test('craft tree stays inside the same app shell instead of opening a separate mini-app', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/catalog?campaign=Sharandar&q=Feywood%20Broad%20Slab')

    const card = page.locator('.catalog .items article').filter({ hasText: 'Feywood Broad Slab' }).first()
    await expect(card).toBeVisible()
    await card.locator('.item-foot > button').click()

    const nav = page.locator('.tablet-v4-sidebar')
    await nav.getByRole('button', { name: 'Plan & Craft' }).click()
    await page.getByRole('tab', { name: 'Craft tree' }).click()

    await expect(nav).toBeVisible()
    const tree = page.locator('.masterwork-tree-shell')
    await expect(tree).toBeVisible()
    expect(await tree.evaluate((node) => getComputedStyle(node).position)).not.toBe('fixed')
    await expect(tree.locator('.masterwork-tree-sidebar')).toHaveCount(0)
  })

  for (const route of ['readiness', 'explore', 'graph', 'data-health']) {
    test(`${route} uses the same desktop workspace shell`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto(`/${route}`)
      await expect(page.locator('.tablet-v4-sidebar')).toBeVisible()
      await expect(page.locator('.mw-page-topbar')).toBeHidden()
    })
  }

  test('phone keeps one navigation system and purposeful compact content', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/catalog')

    const nav = page.locator('.mobile-v4-tabbar')
    await expect(nav).toBeVisible()
    for (const label of ['Catalog', 'Plan & Craft', 'Materials', 'Progression']) {
      await expect(nav.getByRole('button', { name: label }).or(nav.getByRole('link', { name: label }))).toBeVisible()
    }

    await expect(page.locator('.hero')).toBeHidden()
    await expect(page.locator('.collection-switcher')).toBeVisible()
    const collection = await page.locator('.collection-switcher').boundingBox()
    expect(collection?.y || 9999).toBeLessThan(180)
  })
})
