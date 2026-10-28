import { expect, test } from '@playwright/test'

test('Reference uses the full content width instead of three outer columns', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/reference')
  const reference = page.locator('.workshop-reference')
  const hero = reference.locator('.reference-hero')
  const cards = reference.locator('.reference-grid > .panel')
  await expect(hero.getByRole('heading', { name: 'Crafting context beyond the recipe tree' })).toBeVisible()
  await expect(cards).toHaveCount(3)
  const [referenceBox, heroBox, first, second, third] = await Promise.all([
    reference.boundingBox(), hero.boundingBox(),
    cards.nth(0).boundingBox(), cards.nth(1).boundingBox(), cards.nth(2).boundingBox(),
  ])
  expect(referenceBox).not.toBeNull()
  expect(heroBox).not.toBeNull()
  expect(heroBox!.width / referenceBox!.width).toBeGreaterThan(.98)
  expect(heroBox!.height).toBeLessThan(260)
  expect(first!.y).toBeGreaterThanOrEqual(heroBox!.y + heroBox!.height - 2)
  expect(second!.x).toBeGreaterThan(first!.x + first!.width - 2)
  expect(third!.x).toBeGreaterThan(second!.x + second!.width - 2)
  for (const card of [first, second, third]) expect(card!.width).toBeGreaterThan(250)
  await page.getByRole('tab', { name: 'Sources' }).click()
  await expect(reference.locator('.reference-grid > .panel')).toHaveCount(4)
  const sourceGridColumns = await reference.locator('.reference-grid').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)
  expect(sourceGridColumns).toBe(2)
})

test('Reference remains readable on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/reference')
  const cards = page.locator('.workshop-reference .reference-grid > .panel')
  await expect(cards).toHaveCount(3)
  const positions = await cards.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().x))
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(3)
  await page.getByRole('tab', { name: 'Artisans' }).click()
  await expect(page.getByRole('tab', { name: 'Artisans' })).toHaveAttribute('aria-selected', 'true')
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})

test('Journey shows parallel evidence sections without wasting its chapter width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/journey')
  await expect(page.getByRole('heading', { name: 'Masterwork journey' })).toBeVisible()
  const sections = page.locator('.journey-chapter > .journey-chapter-section')
  await expect(sections.first()).toBeVisible()
  expect(await sections.count()).toBeGreaterThanOrEqual(2)
  const [chapter, first, second] = await Promise.all([
    page.locator('.journey-chapter').boundingBox(),
    sections.nth(0).boundingBox(), sections.nth(1).boundingBox(),
  ])
  expect(chapter).not.toBeNull()
  expect(chapter!.width).toBeGreaterThan(650)
  expect(second!.x).toBeGreaterThan(first!.x + first!.width - 2)
  const taskSize = await page.locator('.journey-task p').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))
  expect(taskSize).toBeGreaterThanOrEqual(14)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})

test('Journey retains a single reading column on phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/journey')
  const sections = page.locator('.journey-chapter > .journey-chapter-section')
  await expect(sections.nth(1)).toBeVisible()
  const [a, b] = await Promise.all([sections.nth(0).boundingBox(), sections.nth(1).boundingBox()])
  expect(Math.abs(a!.x - b!.x)).toBeLessThan(3)
  expect(b!.y).toBeGreaterThan(a!.y)
  await page.getByRole('button', { name: /Gather and craft/i }).click()
  await expect(page.locator('.journey-chapter h2')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})

test('Workbench inspector retains legible data and usable quantity targets', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/catalog')
  const order = page.locator('.forge-work-order')
  await expect(order).toBeVisible()
  const button = order.getByRole('button', { name: 'Increase craft quantity' })
  const box = await button.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThanOrEqual(40)
  expect(box!.height).toBeGreaterThanOrEqual(40)
  const size = await order.locator('.forge-order-stat').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize))
  expect(size).toBeGreaterThanOrEqual(13)
  const quantity = order.getByLabel('Craft quantity')
  await expect(quantity).toHaveText('1')
  await button.click()
  await expect(quantity).toHaveText('2')
})
