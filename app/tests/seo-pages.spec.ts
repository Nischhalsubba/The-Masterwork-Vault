import { expect, test } from '@playwright/test'

test('guide index and public recipe pages are readable without running app JavaScript', async ({ page }) => {
  await page.goto('/guides/')
  await expect(page.getByRole('heading', { level: 1, name: 'Masterwork crafting guides' })).toBeVisible()
  await page.getByRole('link', { name: 'Browse recipes' }).click()
  await expect(page.getByRole('heading', { name: 'Neverwinter recipe index' })).toBeVisible()
  const first = page.locator('.directory a[href^="/guides/recipes/"]').first()
  await expect(first).toBeVisible()
  await first.click()
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('.ingredients li').first()).toBeVisible()
  await expect(page.locator('script[src]')).toHaveCount(0)
  const data = await page.evaluate(() => ({
    title: document.title,
    canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href,
    schema: document.querySelector('script[type="application/ld+json"]')?.textContent ?? '',
    current: window.location.href,
  }))
  expect(data.title).toContain('Masterwork')
  expect(data.canonical).toBe('https://neverwintermastercraft.netlify.app' + new URL(data.current).pathname)
  expect(JSON.parse(data.schema)['@graph'].some((x: { '@type': string }) => x['@type'] === 'BreadcrumbList')).toBeTruthy()
})

test('source index discloses evidence status and links to source-backed materials', async ({ page }) => {
  await page.goto('/guides/materials/')
  await expect(page.getByRole('heading', { name: 'Neverwinter material source index' })).toBeVisible()
  await page.locator('.directory a').first().click()
  await expect(page.getByRole('heading', { name: /Where to obtain it/i })).toBeVisible()
  await expect(page.getByText('Current-game availability is not confirmed.', { exact: false })).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/guides\/materials\//)
})

test('sitemap is generated with individual canonical guide URLs', async ({ request }) => {
  const response = await request.get('/sitemap.xml')
  expect(response.ok()).toBeTruthy()
  const body = await response.text()
  expect(body).toContain('/guides/recipes/')
  expect(body).toContain('/guides/materials/')
  expect(body).not.toContain('/plan</loc>')
})

test('SPA public and private routes have distinct initial index metadata', async ({ request }) => {
  for (const [route, expected] of [['/catalog/', 'index,follow'], ['/materials/', 'index,follow'], ['/plan/', 'noindex,follow']] as const) {
    const response = await request.get(route)
    expect(response.ok(), route).toBeTruthy()
    const html = await response.text()
    expect(html).toContain('name="robots" content="' + expected + '"')
    expect(html).toContain('rel="canonical" href="https://neverwintermastercraft.netlify.app' + route.slice(0,-1) + '"')
  }
})

test('guide directory remains legible at narrow mobile width', async ({ page }) => {
  await page.setViewportSize({width: 320,height: 740})
  await page.goto('/guides/materials/')
  const horizontal = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(horizontal).toBeLessThanOrEqual(1)
  await expect(page.locator('.directory a').first()).toBeVisible()
})
