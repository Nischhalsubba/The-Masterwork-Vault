import { expect, test } from '@playwright/test'

for (const [route, label] of [['explore', 'Search advanced explorer'], ['graph', 'Search graph items']]) {
  test(`${route} keeps its accessible search label out of the visual input layout`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/${route}`)
    const input = page.getByRole('textbox', { name: label, exact: true })
    await expect(input).toBeVisible()
    const hiddenLabel = page.locator('.mw-explore-search .sr-only')
    const size = await hiddenLabel.boundingBox()
    expect(size).not.toBeNull()
    expect(size!.width).toBeLessThanOrEqual(1)
    expect(size!.height).toBeLessThanOrEqual(1)
    await input.fill('Potion')
    await expect(input).toHaveValue('Potion')
  })
}

test('readiness does not present self-reported preparation as a verified unlock gate', async ({ page }) => {
  await page.goto('/readiness')
  const main = page.getByRole('main')
  await expect(main).toContainText('Full-path preparation')
  await expect(main).toContainText('not a live eligibility check')
  await expect(main).not.toContainText('Know exactly what unlocks next')
  await expect(main).not.toContainText('Not a modern Masterwork book gate')
  await expect(main).not.toContainText('Prereqs marked ready')
})

test('mobile Explorer disclosure preserves filter state across closing and reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/explore?campaign=Sharandar&recipe=captured')
  const fields = page.locator('#explorer-filter-fields')
  await expect(fields).toBeHidden()
  await page.getByRole('button', { name: /^Filters/ }).click()
  await expect(page.getByRole('button', { name: /^Hide filters/ })).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('checkbox', { name: 'Sharandar', exact: true })).toBeChecked()
  await expect(page.getByRole('checkbox', { name: 'Recipe captured', exact: true })).toBeChecked()
  await page.getByRole('button', { name: /^Hide filters/ }).click()
  await expect(fields).toBeHidden()
  await expect.poll(() => new URL(page.url()).searchParams.get('campaign')).toBe('Sharandar')
  await page.reload()
  await page.getByRole('button', { name: /^Filters/ }).click()
  await expect(page.getByRole('checkbox', { name: 'Sharandar', exact: true })).toBeChecked()
})
