import { expect, test, type Page } from '@playwright/test'

async function openIndex(page: Page) {
  await page.goto('/materials')
  await page.getByRole('button', { name: /Browse material sources/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Material acquisition guide', exact: true })
  await expect(dialog).toBeVisible()
  return dialog
}

test('source search recognizes natural spelling aliases', async ({ page }) => {
  const dialog = await openIndex(page)
  await dialog.getByLabel('Find a material, location or method').fill('Duergarsteel Scrap')
  await expect(dialog.locator('.acquisition-index > details')).toHaveCount(1)
  await expect(dialog.locator('.acquisition-index > details > summary')).toContainText('Druegarsteel Scrap')
})

test('source search finds the named hunt modifier', async ({ page }) => {
  const dialog = await openIndex(page)
  await dialog.getByLabel('Find a material, location or method').fill('Tricky Reversal')
  await expect(dialog.locator('.acquisition-index > details')).toHaveCount(3)
  await expect(dialog.locator('.acquisition-index > details > summary').filter({ hasText: 'Mushroom Droplet' })).toHaveCount(1)
})

test('collapsed source index defers detailed guide rendering', async ({ page }) => {
  const dialog = await openIndex(page)
  await expect(dialog.locator('.acquisition-index > details')).toHaveCount(44)
  await expect(dialog.locator('.acquisition-index .acquisition-guide')).toHaveCount(0)
  await dialog.getByLabel('Find a material, location or method').fill('Mushroom Log')
  await dialog.locator('.acquisition-index > details > summary').click()
  await expect(dialog.locator('.acquisition-index .acquisition-guide')).toHaveCount(1)
})

test('source method and evidence filters combine with a working reset', async ({ page }) => {
  const dialog = await openIndex(page)
  await dialog.getByLabel('Acquisition method', { exact: true }).selectOption('Workshop crafting')
  await expect(dialog.locator('.acquisition-index > details')).toHaveCount(2)
  await dialog.getByLabel('Evidence', { exact: true }).selectOption('unresolved')
  await expect(dialog.getByRole('heading', { name: 'No matching materials' })).toBeVisible()
  await dialog.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await expect(dialog.locator('.acquisition-index > details')).toHaveCount(44)
  await expect(dialog.getByLabel('Acquisition method', { exact: true })).toHaveValue('all')
  await expect(dialog.getByLabel('Evidence', { exact: true })).toHaveValue('all')
  await expect(dialog.getByLabel('Find a material, location or method')).toBeFocused()
})

test('source modal keeps keyboard focus, ignores background shortcuts and restores scroll lock', async ({ page }) => {
  await page.goto('/materials')
  const before = await page.evaluate(() => document.body.style.overflow)
  const trigger = page.getByRole('button', { name: /Browse material sources/ })
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Material acquisition guide', exact: true })
  await expect(dialog.getByRole('heading', { name: 'Material acquisition guide', exact: true })).toBeFocused()
  const close = dialog.getByRole('button', { name: 'Close material sources' })
  const last = dialog.locator('.acquisition-index > details > summary').last()
  await last.focus()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('Shift+Tab')
  await expect(last).toBeFocused()
  await page.keyboard.press('Control+k')
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
  await expect(trigger).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(before)
  await trigger.click()
  await page.getByRole('button', { name: 'Close material sources' }).click()
  await expect(trigger).toBeFocused()
  expect(await page.evaluate(() => document.body.style.overflow)).toBe(before)
})

test('source modal in item details closes without dismissing the parent drawer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'phone', 'Desktop details drawer; phone uses the direct item page')
  await page.goto('/catalog?campaign=Sharandar&q=Crafted%20Potion%20of%20Accuracy%20Rank%2013')
  await page.locator('.catalog .items .item-main').filter({ hasText: 'Crafted Potion of Accuracy Rank 13' }).first().click()
  await page.getByRole('button', { name: /Details/ }).click()
  const outer = page.getByRole('dialog', { name: /details/i })
  await expect(outer).toBeVisible()
  const trigger = outer.getByRole('button', { name: 'Where to get Sugar Beet', exact: true })
  await trigger.click()
  const inner = page.getByRole('dialog', { name: 'Sugar Beet', exact: true })
  await expect(inner).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(inner).not.toBeVisible()
  await expect(outer).toBeVisible()
  await expect(trigger).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(outer).not.toBeVisible()
})

for (const width of [320, 768, 1440]) {
  test(`source guide reflows and keeps close reachable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const dialog = await openIndex(page)
    await expect(dialog.getByRole('button', { name: 'Close material sources' })).toBeInViewport()
    expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    expect(await dialog.locator('.acquisition-dialog-body').evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    for (const control of await dialog.locator('input, select, button').all()) {
      const box = await control.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
    }
    await page.screenshot({ path: testInfo.outputPath(`material-sources-index-${width}-${testInfo.project.name}.png`) })
    await dialog.getByLabel('Find a material, location or method').fill('Honey')
    await dialog.locator('.acquisition-index > details > summary').click()
    await expect(dialog.getByRole('heading', { name: 'Where to get Honey' })).toBeVisible()
    await dialog.locator('.acquisition-steps').scrollIntoViewIfNeeded()
    expect(await dialog.locator('.acquisition-dialog-body').evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true)
    await expect(dialog.getByRole('button', { name: 'Close material sources' })).toBeInViewport()
    await page.screenshot({ path: testInfo.outputPath(`material-sources-guide-${width}-${testInfo.project.name}.png`) })
    await dialog.getByRole('button', { name: 'Close material sources' }).click()
    await expect(dialog).not.toBeVisible()
  })
}
