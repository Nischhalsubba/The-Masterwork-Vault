import { expect,test,type Page } from '@playwright/test'
async function openReference(page:Page) {
  await page.goto('/journey#journey-craftables')
  await page.getByRole('button',{name:'Standard + Gathering (932)',exact:true}).click()
  const reference=page.getByRole('region',{name:'From your first craft to level 20.'})
  await expect(reference.getByRole('status')).toContainText('907 matching crafting tasks')
  return reference
}
test('standard reference resolves exact ingredients without inventing a yield',async({page})=>{
  const reference=await openReference(page)
  await reference.getByLabel('Search standard tasks or ingredients').fill('Honey')
  const row=reference.locator('.profession-reference-row').filter({has:page.getByText('Honey',{exact:true})}).first()
  await row.locator('summary').first().click()
  await expect(row).toContainText('Beehive Chip')
  await expect(row).toContainText('Recorded Gathering level 10')
  await expect(row).toContainText('Not recorded in this source')
  await expect(row.getByRole('link',{name:'Open the original task record'})).toHaveAttribute('href','https://neverwinterdata.notion.site/b712635de67145a1bda6c0e7f87adcab')
  await expect(row.getByRole('button',{name:'Add to plan'})).toHaveCount(0)
  await row.getByRole('button',{name:'Search this ingredient'}).click()
  await expect(reference.getByLabel('Search standard tasks or ingredients')).toHaveValue('Beehive Chip')
  await expect(reference.getByLabel('Search standard tasks or ingredients')).toBeFocused()
})

test('standard reference includes the level 1-20 Gathering route with recorded yields',async({page})=>{
  const reference=await openReference(page)
  await reference.getByRole('button',{name:'Gathering (25)',exact:true}).click()
  await expect(reference.getByRole('status')).toContainText('25 gathering tasks')
  const aegwyrt=reference.locator('.gathering-reference-row').filter({has:page.getByText('Aegwyrt',{exact:true})})
  await expect(aegwyrt).toContainText('Level 20')
  await expect(aegwyrt).toContainText('×12')
  await expect(aegwyrt).toContainText('No consumed ingredients')
  await expect(aegwyrt.getByRole('link',{name:'Gathering source'})).toHaveAttribute('href','https://neverwinter.fandom.com/wiki/Gathering')
  await expect(reference).toContainText('Community wiki snapshot reviewed 18 September 2026')
})

test('reference filters preserve unknown and conflicting levels',async({page})=>{
  const reference=await openReference(page)
  await reference.getByLabel('Recorded task level',{exact:true}).selectOption('unknown')
  await expect(reference.getByRole('status')).toContainText('2 matching crafting tasks')
  await reference.getByRole('button',{name:'Reset reference filters'}).click()
  await reference.getByLabel('Search standard tasks or ingredients').fill('Linseed Oil')
  const row=reference.locator('.profession-reference-row').filter({has:page.getByText('Linseed Oil',{exact:true})}).first()
  await row.locator('summary').first().click()
  await expect(row).toContainText('Source conflict: the Level field says 5')
  await reference.getByLabel('Reference profession',{exact:true}).selectOption('Tailoring')
  await expect(reference.getByRole('status')).toContainText('0 matching crafting tasks')
})
test('reference delays mounting rows and keeps captured catalog separate',async({page})=>{
  const reference=await openReference(page)
  await expect(reference.locator('.profession-reference-row')).toHaveCount(30)
  await expect(reference.locator('.journey-output-detail')).toHaveCount(0)
  await reference.getByRole('button',{name:/Show 30 more tasks/}).click()
  await expect(reference.locator('.profession-reference-row')).toHaveCount(60)
  await page.getByRole('button',{name:'Masterwork catalog',exact:true}).click()
  await expect(page.getByRole('heading',{name:'Every output captured in this Vault.'})).toBeVisible()
  await expect(page.locator('.profession-reference')).toHaveCount(0)
})
test('failed reference load offers a working retry',async({page})=>{
  let fail=true
  await page.route('**/professionReference.snapshot-*.json',route=> fail ? route.abort() : route.continue())
  await page.goto('/journey#journey-craftables')
  await page.getByRole('button',{name:'Standard professions (907)',exact:true}).click()
  await expect(page.getByRole('alert')).toContainText('could not be loaded')
  fail=false
  await page.getByRole('button',{name:'Retry reference'}).click()
  await expect(page.locator('.profession-reference').getByRole('status')).toContainText('907 matching crafting tasks')
})
for (const width of [320,390,768,1024,1440]) test(`standard recipe layout reflows at ${width}px`,async({page},testInfo)=>{
  await page.setViewportSize({width,height:900})
  const reference=await openReference(page)
  await reference.getByLabel('Search standard tasks or ingredients').fill('Honey')
  if (width <= 680) {
    const filters = await reference.locator('.profession-reference-filters').boundingBox()
    expect(filters).not.toBeNull()
    for (const name of ['Reference profession','Recorded task level']) {
      const control = await reference.getByRole('combobox',{name,exact:true}).boundingBox()
      expect(control).not.toBeNull()
      expect(control!.width, `${name} must use the phone reading width`).toBeGreaterThanOrEqual(filters!.width - 1)
    }
  }
  const row=reference.locator('.profession-reference-row').filter({has:page.getByText('Honey',{exact:true})}).first()
  await row.locator('summary').first().click()
  await row.scrollIntoViewIfNeeded()
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true)
  expect(await reference.evaluate(element=>element.scrollWidth<=element.clientWidth+1)).toBe(true)
  await page.screenshot({path:testInfo.outputPath(`journey-standard-${width}-${testInfo.project.name}.png`),fullPage:true})
})
