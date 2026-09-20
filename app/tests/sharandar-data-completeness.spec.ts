import { expect, test } from '@playwright/test'

type ExpectedCraft = {
  name: string
  className: string
  profession: string
  ingredients?: string[]
}

const recovered: ExpectedCraft[] = [
  { name: 'Lacquered Leaf Waders', className: 'Cleric', profession: 'Leatherworking' },
  { name: 'Petrified Braces', className: 'Bard', profession: 'Leatherworking' },
  { name: 'Petrified Wraps', className: 'Bard', profession: 'Leatherworking' },
  { name: 'Petrified Wristlets', className: 'Bard', profession: 'Leatherworking' },
  { name: "Fey'd Leaf Branches", className: 'Wizard', profession: 'Tailoring' },
  { name: 'Petrified Bark Barbute', className: 'Rogue', profession: 'Leatherworking' },
  { name: 'Sprouting Crown', className: 'Wizard', profession: 'Leatherworking' },
  { name: "Fey'd Leaf Wood Crown", className: 'Wizard', profession: 'Tailoring' },
  { name: "Fey'd Leaf Wood Wraps", className: 'Wizard', profession: 'Tailoring', ingredients: ['Crystalline Ornament', "Lacquered 'Aged' Leather", 'Fey Fibers', 'Salty Tears Varnish'] },
  { name: "Fey'd Leaf Branch Crown", className: 'Wizard', profession: 'Tailoring', ingredients: ['Woven Whiskers', 'Thorned Ornament', 'Woven Fey Leaves', 'Salty Tears Varnish'] },
  { name: 'Twig Crown', className: 'Warlock', profession: 'Leatherworking' },
  { name: 'Petrified Armlets', className: 'Bard', profession: 'Leatherworking', ingredients: ["Lacquered 'Aged' Leather", 'Thorned Ornament', 'Fey Fibers', 'Salty Tears Varnish'] },
  { name: 'Petrified Guards', className: 'Bard', profession: 'Leatherworking', ingredients: ["Lacquered 'Aged' Leather", 'Woven Whiskers', 'Lacquered Leaves', 'Salty Tears Varnish'] },
  { name: 'Petrified Wristguards', className: 'Bard', profession: 'Leatherworking', ingredients: ["Lacquered 'Aged' Leather", 'Thorned Ornament', 'Fey Fibers', 'Salty Tears Varnish'] },
  { name: 'Petrified Barbute', className: 'Rogue', profession: 'Leatherworking' },
  { name: 'Thorned Amulet +1', className: 'All classes', profession: 'Jewelcrafting', ingredients: ['Living Feywood', 'Thorned Ornament', 'Beads of Light', "Ears 'n Tears"] },
  { name: 'Feywood Amulet +1', className: 'All classes', profession: 'Jewelcrafting', ingredients: ['Living Feywood', 'Feywood Lumber', 'Beads of Light', "Ears 'n Tears"] },
  { name: 'Thorned Sash +1', className: 'All classes', profession: 'Tailoring', ingredients: ["Frozen Dawn's Dew", 'Thorned Ornament', 'Woven Fey Leaves', 'Woven Whiskers'] },
  { name: 'Feywood Sash +1', className: 'All classes', profession: 'Tailoring', ingredients: ['Living Feywood', 'Beads of Light', 'Woven Fey Leaves', 'Woven Whiskers'] },
  { name: "Dawn's Light Sash +1", className: 'All classes', profession: 'Tailoring', ingredients: ["Dawn's Silver Enamel", 'Silver Vines', 'Woven Fey Leaves', 'Woven Whiskers'] },
]

test('reconciled Sharandar craftables expose class, profession, level and recipe', async ({ page }) => {
  test.setTimeout(120_000)

  for (const entry of recovered) {
    await page.goto('/catalog?campaign=Sharandar&q=' + encodeURIComponent(entry.name))
    const row = page.locator('.catalog .items .item-main').filter({ hasText: entry.name }).first()
    await expect(row, entry.name).toBeVisible()
    await expect(row, entry.name).not.toContainText('Class not captured')
    await expect(row, entry.name).toContainText(entry.className)
    await expect(row, entry.name).toContainText('Profession level 20')

    await row.click()
    const detail = page.locator('.catalog .detail')
    await expect(detail.getByRole('heading', { name: entry.name, exact: true }), entry.name).toBeVisible()
    await expect(detail, entry.name).not.toContainText('Recipe not captured yet')
    await expect(detail, entry.name).not.toContainText('Profession not captured')
    await expect(detail, entry.name).toContainText(entry.profession + ' crafting')
    await expect(detail, entry.name).toContainText('Profession level 20')

    for (const ingredient of entry.ingredients ?? []) {
      await expect(detail, entry.name + ' ingredient ' + ingredient).toContainText(ingredient)
    }
  }
})

test('unsupported Sharandar facts stay explicit instead of being guessed', async ({ page }) => {
  const unresolved = ['Feywood Bark', 'Feywood Bark Barbute', 'Feywood Blightbark']
  for (const name of unresolved) {
    await page.goto('/catalog?campaign=Sharandar&q=' + encodeURIComponent(name))
    await expect(page.locator('.catalog .items .item-main').filter({ hasText: name }).first()).toBeVisible()
  }
})

test('Data Health names only the remaining attributable class and recipe gaps', async ({ page }) => {
  await page.goto('/data-health')

  const classPanel = page.locator('.mw-health-panel').filter({ hasText: 'Missing class assignments' })
  const recipePanel = page.locator('.mw-health-panel').filter({ hasText: 'Missing item recipes' })

  await expect(classPanel).toBeVisible()
  await expect(recipePanel).toBeVisible()

  for (const entry of recovered) {
    await expect(classPanel).not.toContainText(entry.name)
    await expect(recipePanel).not.toContainText(entry.name)
  }

  for (const name of ['Feywood Bark', 'Feywood Bark Barbute', 'Feywood Blightbark']) {
    await expect(classPanel).toContainText(name)
  }
  await expect(recipePanel).toContainText('Feywood Blightbark')
})


test('verified Sharandar icon aliases reuse the exact rendered local game asset', async ({ page }) => {
  const aliases = [
    ["Fey'd Leaf Wood Wraps", "Fey'd Leaf Branches"],
    ["Fey'd Leaf Branch Crown", "Fey'd Leaf Wood Crown"],
    ['Petrified Armlets', 'Petrified Braces'],
    ['Petrified Guards', 'Petrified Braces'],
    ['Petrified Wristguards', 'Petrified Braces'],
    ['Petrified Barbute', 'Petrified Bark Barbute'],
  ] as const

  for (const [alias, canonical] of aliases) {
    await page.goto('/catalog?campaign=Sharandar&q=' + encodeURIComponent(alias))
    const aliasImage = page.locator('.catalog .items .item-main').filter({ hasText: alias }).first().locator('img.thumb')
    await expect(aliasImage, alias).toBeVisible()
    const aliasSrc = await aliasImage.getAttribute('src')

    await page.goto('/catalog?campaign=Sharandar&q=' + encodeURIComponent(canonical))
    const canonicalImage = page.locator('.catalog .items .item-main').filter({ hasText: canonical }).first().locator('img.thumb')
    await expect(canonicalImage, canonical).toBeVisible()
    const canonicalSrc = await canonicalImage.getAttribute('src')

    expect(aliasSrc, alias).toBeTruthy()
    expect(aliasSrc, alias).toBe(canonicalSrc)
  }
})

test('verified Sharandar icons request exact game art and fall back without broken thumbnails', async ({ page }) => {
  const expected = [
    ['Twig Crown', 'Icons Inventory Masterwork Head Warlock Fey Druidic M 01.png'],
    ['Feywood Sash +1', 'Inventory Waist Stronghold Crafted Physical Feywood.png'],
    ['Thorned Sash +1', 'Inventory Waist Stronghold Crafted Healer Thorned.png'],
    ["Dawn's Light Sash +1", 'Inventory Waist Stronghold Crafted Tank Silvervine.png'],
    ['Thorned Amulet +1', 'Inventory_Neck_Stronghold_Crafted_Healer_Thorned.png'],
    ['Feywood Amulet +1', 'Inventory_Neck_Stronghold_Crafted_Physical_Feywood.png'],
    ['Crafted Potion of Accuracy Rank 13', 'Inventory_Consumables_Potion_T13_Alchemical_Blue.png'],
    ['Crafted Potion of Critical Strike Rank 13', 'Inventory_Consumables_Potion_T13_Alchemical_Electric.png'],
    ['Crafted Potion of Defense Rank 13', 'Inventory_Consumables_Potion_T13_Alchemical_Water.png'],
    ['Crafted Potion of Deflect Rank 13', 'Inventory_Consumables_Potion_T13_Alchemical_Green.png'],
    ['Crafted Potion of Power Rank 13', 'Inventory_Consumables_Potion_T13_Alchemical_Yellowgreen.png'],
  ] as const

  const requested: string[] = []
  await page.route('https://neverwinter.fandom.com/**', async (route) => {
    requested.push(route.request().url())
    await route.abort()
  })

  for (const [name, assetFile] of expected) {
    requested.length = 0
    await page.goto('/catalog?campaign=Sharandar&q=' + encodeURIComponent(name))
    const row = page.locator('.catalog .items .item-main').filter({ hasText: name }).first()
    await expect(row, name).toBeVisible()

    await expect.poll(() => requested.some((url) => url.includes('/wiki/Special:Redirect/file/' + encodeURIComponent(assetFile))), {
      message: name + ' should request the exact verified Neverwinter asset',
    }).toBe(true)

    const image = row.locator('img.thumb')
    await expect(image, name).toBeVisible()
    await expect(image, name).toHaveClass(/reference-fallback/)
    await expect(row.locator('.sprite.fallback'), name).toHaveCount(0)
    await expect.poll(async () => image.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0), {
      message: name + ' should retain a renderable fallback when the remote host is unavailable',
    }).toBe(true)
  }
})

test('Data Health exposes authentic artwork gaps instead of hiding reference icons', async ({ page }) => {
  await page.goto('/data-health')
  await expect(page.getByText('Authentic artwork gaps', { exact: true })).toBeVisible()
  const queue = page.locator('.mw-health-panel').filter({ hasText: 'Authentic artwork gap queue' })
  await expect(queue).toBeVisible()

  // These now reuse exact, source-attributed Neverwinter game assets.
  for (const name of [
    "Fey'd Leaf Wood Wraps",
    "Fey'd Leaf Branch Crown",
    'Petrified Armlets',
    'Petrified Guards',
    'Petrified Wristguards',
    'Petrified Barbute',
    'Twig Crown',
    'Thorned Sash +1',
    'Feywood Sash +1',
    "Dawn's Light Sash +1",
    'Thorned Amulet +1',
    'Feywood Amulet +1',
    'Crafted Potion of Accuracy Rank 13',
    'Crafted Potion of Critical Strike Rank 13',
    'Crafted Potion of Defense Rank 13',
    'Crafted Potion of Deflect Rank 13',
    'Crafted Potion of Power Rank 13',
  ]) {
    await expect(queue).not.toContainText(name)
  }
})
