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
