import { test } from '@playwright/test'

const targets = [
  'Feywood Bark',
  'Feywood Bark Barbute',
  'Feywood Blightbark',
  'Feywood Sprouts',
  'Feywood Buckler',
  'Feywood Shield',
  "Fey'd Leaf Wood Wraps",
  "Fey'd Leaf Branch Crown",
  'Twig Crown',
  'Petrified Armlets',
  'Petrified Guards',
  'Petrified Wristguards',
  'Petrified Barbute',
]

const clip = (value: string, needle: string) => {
  const haystack = value.toLowerCase()
  const index = haystack.indexOf(needle.toLowerCase())
  return index < 0 ? null : value.slice(Math.max(0, index - 700), Math.min(value.length, index + needle.length + 1600))
}

test('temporary research: inspect NW-Hub gear data and network endpoints', async ({ page }) => {
  test.setTimeout(120_000)
  const responses: string[] = []
  page.on('response', (response) => {
    const url = response.url()
    if (/api|gear|item|equipment|data/i.test(url)) responses.push(url)
  })
  try {
    await page.goto('https://nw-hub.com/gear/list', { waitUntil: 'domcontentloaded', timeout: 60_000 })
    await page.waitForTimeout(8_000)
    const body = await page.locator('body').innerText().catch(() => '')
    console.log('NWHUB_TITLE=' + await page.title())
    console.log('NWHUB_URL=' + page.url())
    console.log('NWHUB_RESPONSES=' + JSON.stringify([...new Set(responses)].slice(0, 120)))
    for (const target of targets) {
      const hit = clip(body, target)
      if (hit) console.log('NWHUB_HIT ' + target + '=' + JSON.stringify(hit))
    }

    const search = page.getByRole('textbox', { name: /Search name/i }).first()
    if (await search.count()) {
      const researchNames = [
        ...targets,
        'Feywood Barkbrace',
        'Heavy Feywood Barbute',
        'Feywood Breastplate',
        'Feywood Chestguard',
        'Feywood Cuirass',
        'Hardened Feywood Cuirass',
        'Feywood Sallet',
        'Feywood Wristguards',
        'Feywood Gauntlets',
      ]
      for (const target of researchNames) {
        await search.fill(target)
        await page.waitForTimeout(250)
        const filtered = await page.locator('body').innerText().catch(() => '')
        const tableStart = filtered.indexOf('Name')
        console.log('NWHUB_FILTER ' + target + '=' + JSON.stringify(filtered.slice(Math.max(0, tableStart), Math.min(filtered.length, Math.max(0, tableStart) + 7000))))
      }
      await search.fill('')
    }

    const resources = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => (entry as PerformanceResourceTiming).name))
    console.log('NWHUB_RESOURCES=' + JSON.stringify(resources.filter((url) => /api|gear|item|equipment|json/i.test(url)).slice(0, 160)))
  } catch (error) {
    console.log('NWHUB_ERROR=' + String(error))
  }
})

test('temporary research: inspect maintained Neverwinter Wiki pages/search', async ({ page }) => {
  test.setTimeout(180_000)
  const urls = [
    'https://neverwinter.fandom.com/ru/wiki/%D0%9A%D1%80%D0%BE%D0%B9%D0%BA%D0%B0_%D0%B8_%D1%88%D0%B8%D1%82%D1%8C%D0%B5',
    'https://neverwinter.fandom.com/ru/wiki/%D0%9E%D0%B1%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B0_%D0%BA%D0%BE%D0%B6%D0%B8',
    'https://neverwinter.fandom.com/ru/wiki/%D0%9A%D1%83%D0%B7%D0%BD%D0%B5%D1%87%D0%BD%D0%BE%D0%B5_%D0%B4%D0%B5%D0%BB%D0%BE',
    'https://neverwinter.fandom.com/ru/wiki/%D0%9F%D0%BB%D0%B5%D1%82%D0%B5%D0%BD%D0%B8%D0%B5_%D0%BA%D0%BE%D0%BB%D0%B5%D1%86',
  ]
  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      await page.waitForTimeout(2_000)
      const body = await page.locator('body').innerText().catch(() => '')
      console.log('FANDOM_PAGE=' + page.url() + ' title=' + await page.title())
      for (const target of targets) {
        const hit = clip(body, target)
        if (hit) console.log('FANDOM_HIT ' + target + '=' + JSON.stringify(hit))
      }
      const images = await page.locator('img').evaluateAll((nodes) => nodes.map((node) => ({
        src: (node as HTMLImageElement).currentSrc || (node as HTMLImageElement).src,
        alt: node.getAttribute('alt') || '',
      })).filter((row) => row.src && /fey|petrif|twig|blight|bark/i.test(row.src + ' ' + row.alt)).slice(0, 80))
      if (images.length) console.log('FANDOM_IMAGES=' + JSON.stringify(images))
    } catch (error) {
      console.log('FANDOM_ERROR ' + url + '=' + String(error))
    }
  }

  for (const target of ['Feywood Bark', 'Feywood Bark Barbute', 'Feywood Blightbark']) {
    try {
      const url = 'https://neverwinter.fandom.com/ru/wiki/%D0%A1%D0%BB%D1%83%D0%B6%D0%B5%D0%B1%D0%BD%D0%B0%D1%8F:%D0%9F%D0%BE%D0%B8%D1%81%D0%BA?query=' + encodeURIComponent(target)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
      await page.waitForTimeout(1_500)
      const body = await page.locator('body').innerText().catch(() => '')
      console.log('FANDOM_SEARCH ' + target + '=' + JSON.stringify(body.slice(0, 10000)))
    } catch (error) {
      console.log('FANDOM_SEARCH_ERROR ' + target + '=' + String(error))
    }
  }
})
