import { expect, test } from '@playwright/test'

test('catalog content renders while optional comparison module is still loading', async ({ page }) => {
  // This reproduces a slow optional chunk independently of the network/CPU
  // conditions in Lighthouse. The recipe browser must not wait for comparison.
  let release: (() => void) | undefined
  let held = false
  await page.route(/\/assets\/CompareWorkbench-[^/]+\.js(?:\?.*)?$/, async (route) => {
    held = true
    await new Promise<void>((resolve) => { release = resolve })
    await route.continue()
  })

  try {
    await page.goto('/catalog/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Find what you need to craft and where to get every material.')).toBeVisible({ timeout: 5000 })
    await expect.poll(() => held, { message: 'optional comparison chunk should still load' }).toBe(true)
  } finally {
    release?.()
  }
})

test('catalog is not suspended while the search palette chunk loads', async ({ page }) => {
  let release: (() => void) | undefined
  let held = false
  await page.route(/\/assets\/CommandPalette-[^/]+\.js(?:\?.*)?$/, async (route) => {
    held = true
    await new Promise<void>((resolve) => { release = resolve })
    await route.continue()
  })

  try {
    await page.goto('/catalog/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Find what you need to craft and where to get every material.')).toBeVisible({ timeout: 5000 })
    await expect.poll(() => held, { message: 'optional command palette chunk should be requested' }).toBe(true)
  } finally {
    release?.()
  }
})
