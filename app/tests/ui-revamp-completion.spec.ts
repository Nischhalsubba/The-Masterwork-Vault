import { expect, test } from '@playwright/test'

const secondaryRoutes = ['/reference', '/readiness', '/explore', '/graph', '/data-health']

test('secondary routes use the same workspace shell and visual surface hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  for (const path of secondaryRoutes) {
    await page.goto(path)
    await expect(page.locator('.mw-workspace-sidebar')).toBeVisible()

    const main = path === '/reference'
      ? page.locator('.app > main')
      : path === '/readiness'
        ? page.locator('.mw-readiness-main')
        : path === '/explore'
          ? page.locator('.mw-explore-main')
          : path === '/graph'
            ? page.locator('.mw-graph-main')
            : page.locator('.mw-health-main')

    await expect(main).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(1)
  }
})

test('reference is a tabbed workspace rather than a disconnected legacy page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/reference')

  await expect(page.locator('.reference-tabs')).toBeVisible()
  await expect(page.locator('.reference')).toBeVisible()
  const tabs = page.locator('.reference-tabs button')
  expect(await tabs.count()).toBeGreaterThan(1)
  await expect(page.locator('.reference .panel').first()).toBeVisible()
})

test('readiness keeps summary, next action and progression matrix in one task flow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/readiness')

  await expect(page.locator('.mw-summary-grid')).toBeVisible()
  await expect(page.locator('.mw-next-action')).toBeVisible()
  await expect(page.locator('.mw-priority-section')).toBeVisible()
  await expect(page.locator('.mw-profession-section')).toBeVisible()
})

test('explorer and graph keep filters or pickers beside their results on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })

  await page.goto('/explore')
  const filterBox = await page.locator('.mw-explore-filters').boundingBox()
  const resultsBox = await page.locator('.mw-explore-results').boundingBox()
  expect(filterBox).not.toBeNull()
  expect(resultsBox).not.toBeNull()
  expect(resultsBox?.x || 0).toBeGreaterThan((filterBox?.x || 0) + (filterBox?.width || 0) - 2)

  await page.goto('/graph')
  const pickerBox = await page.locator('.mw-graph-layout > aside').boundingBox()
  const canvasBox = await page.locator('.mw-graph-canvas').boundingBox()
  expect(pickerBox).not.toBeNull()
  expect(canvasBox).not.toBeNull()
  expect(canvasBox?.x || 0).toBeGreaterThan((pickerBox?.x || 0) + (pickerBox?.width || 0) - 2)
})

test('data health presents metrics, queues and ledger without layout overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/data-health')

  await expect(page.locator('.mw-health-metrics')).toBeVisible()
  await expect(page.locator('.mw-health-grid')).toBeVisible()
  await expect(page.locator('.mw-ledger')).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('global command and compare overlays use the unified dialog system', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/catalog')

  await page.getByRole('button', { name: 'Open universal search' }).click()
  await expect(page.getByRole('dialog', { name: 'Search the entire Vault' })).toBeVisible()
  await page.getByRole('button', { name: 'Close Search the entire Vault' }).click()

  await page.evaluate(() => document.dispatchEvent(new CustomEvent('masterwork:open-compare')))
  await expect(page.getByRole('dialog', { name: 'Compare craftables' })).toBeVisible()
  await page.getByRole('button', { name: 'Close Compare craftables' }).click()
})

test('revamped supporting routes and graph stay within a 320px phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 780 })

  for (const path of secondaryRoutes) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(1)
  }

  await page.goto('/graph')
  const firstCard = page.locator('.mw-graph-card').first()
  await expect(firstCard).toBeVisible()
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth)
  const box = await firstCard.boundingBox()
  expect(box?.width || 0).toBeLessThanOrEqual(viewportWidth)
})

test('tablet supporting routes avoid horizontal page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })

  for (const path of secondaryRoutes) {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, path).toBeLessThanOrEqual(1)
  }
})
