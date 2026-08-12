import { expect, test, type Locator } from '@playwright/test'

async function typeMetrics(locator: Locator) {
  return locator.evaluate((node) => {
    const style = getComputedStyle(node)
    return {
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
      fontWeight: Number.parseInt(style.fontWeight, 10),
      letterSpacing: style.letterSpacing,
    }
  })
}

test('catalog typography uses a readable hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/catalog')

  const body = await typeMetrics(page.locator('body'))
  expect(body.fontSize).toBeGreaterThanOrEqual(15)
  expect(body.lineHeight / body.fontSize).toBeGreaterThanOrEqual(1.5)

  const hero = page.locator('.hero h1')
  await expect(hero).toBeVisible()
  const heroType = await typeMetrics(hero)
  expect(heroType.fontSize).toBeGreaterThanOrEqual(40)
  expect(heroType.fontSize).toBeLessThanOrEqual(64)
  expect(heroType.lineHeight / heroType.fontSize).toBeGreaterThanOrEqual(1)
  expect(heroType.lineHeight / heroType.fontSize).toBeLessThanOrEqual(1.1)
  expect(heroType.fontWeight).toBeGreaterThanOrEqual(700)

  const itemTitle = page.locator('.item-main strong').first()
  const itemMeta = page.locator('.item-main small').first()
  await expect(itemTitle).toBeVisible()
  await expect(itemMeta).toBeVisible()
  expect((await typeMetrics(itemTitle)).fontSize).toBeGreaterThanOrEqual(14)
  expect((await typeMetrics(itemMeta)).fontSize).toBeGreaterThanOrEqual(12)
})

test('major routes share one display scale', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  for (const route of ['/readiness', '/data-health', '/explore', '/graph', '/journey']) {
    await page.goto(route)
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
    const headingType = await typeMetrics(heading)
    expect(headingType.fontSize, route).toBeGreaterThanOrEqual(40)
    expect(headingType.lineHeight / headingType.fontSize, route).toBeGreaterThanOrEqual(0.98)
    expect(headingType.lineHeight / headingType.fontSize, route).toBeLessThanOrEqual(1.12)
    expect(headingType.fontWeight, route).toBeGreaterThanOrEqual(700)

    const brandDetail = page.locator('.mw-page-brand small, .journey-page-brand small').first()
    await expect(brandDetail).toBeVisible()
    expect((await typeMetrics(brandDetail)).fontSize, route).toBeGreaterThanOrEqual(12)
  }
})

test('mobile shell and route typography remain legible without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/catalog')

  const mobileBrandDetail = page.locator('.mobile-v4-brand small')
  const mobileTab = page.locator('.mobile-v4-tabbar button').first()
  await expect(mobileBrandDetail).toBeVisible()
  await expect(mobileTab).toBeVisible()
  expect((await typeMetrics(page.locator('body'))).fontSize).toBeGreaterThanOrEqual(16)
  expect((await typeMetrics(mobileBrandDetail)).fontSize).toBeGreaterThanOrEqual(12)
  expect((await typeMetrics(mobileTab)).fontSize).toBeGreaterThanOrEqual(11.5)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)

  for (const route of ['/readiness', '/explore']) {
    await page.goto(route)
    const body = await typeMetrics(page.locator('body'))
    expect(body.fontSize, route).toBeGreaterThanOrEqual(16)

    const heroBody = page.locator('.mw-readiness-hero p, .mw-explore-hero p').first()
    await expect(heroBody).toBeVisible()
    const heroBodyType = await typeMetrics(heroBody)
    expect(heroBodyType.fontSize, route).toBeGreaterThanOrEqual(16)
    expect(heroBodyType.lineHeight / heroBodyType.fontSize, route).toBeGreaterThanOrEqual(1.55)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, route).toBeLessThanOrEqual(1)
  }
})
