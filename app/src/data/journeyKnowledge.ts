/** Published evidence is not a live-game certification. Unknowns stay explicit. */
export type JourneyEvidence = 'publisher' | 'community' | 'preview'
export interface JourneySource {
  id: string
  title: string
  url: string
  publishedAt: string | null
  reviewedAt: string
  kind: JourneyEvidence
  limitation: string
}
export interface JourneySection { title: string; paragraphs: string[]; sourceIds: string[] }
export interface JourneyPhase {
  id: string; navTitle: string; title: string; summary: string; milestone: string
  tasks: string[]; sections: JourneySection[]; caution: string; sourceIds: string[]
}
export const JOURNEY_REVIEWED_AT = '2026-09-17'
// AsteR MW Unlock Prices!B2:E8, all seven rows; no live-vendor guarantee.
export const JOURNEY_BOOK_PRICES = [500_000, 500_000, 1_500_000, 1_500_000] as const
export const journeySources: JourneySource[] = [
  { id: 'level-rework', title: 'Publisher: Jewel of the North professions update', url: 'https://www.playneverwinter.com/en/news-details/11491453', publishedAt: '2021-07-16', reviewedAt: JOURNEY_REVIEWED_AT, kind: 'publisher', limitation: 'Establishes character Level 8 access and the profession/artisan rescale to 20. It is not a current XP-per-recipe table.' },
  { id: 'book-rework', title: 'Publisher: October 19, 2021 professions patch', url: 'https://www.playneverwinter.com/en/news-details/11500323', publishedAt: '2021-10-19', reviewedAt: JOURNEY_REVIEWED_AT, kind: 'publisher', limitation: 'Documents ordered book purchases, listed prices and removal of the old Artisan storyline. Current vendor eligibility is not fully specified.' },
  { id: 'grand-upgrade', title: 'Publisher: Demonweb Pits launch patch', url: 'https://www.playneverwinter.com/en/news-details/11548793', publishedAt: '2023-07-18', reviewedAt: JOURNEY_REVIEWED_AT, kind: 'publisher', limitation: 'Explicitly reduces The Grand Upgrade to 2,500,000 credits from 5,000,000. Does not establish every earlier rank trigger.' },
  { id: 'tool-correction', title: 'Publisher: November 2023 Masterwork corrections', url: 'https://www.playneverwinter.com/en/news-details/11557773', publishedAt: '2023-11-06', reviewedAt: JOURNEY_REVIEWED_AT, kind: 'publisher', limitation: 'Alembics belong to Armorsmithing books; Menzoberranzan +1 materials were corrected to increase Focus. Old book assignments can be wrong.' },
  { id: 'workshop', title: 'Community wiki: Workshop and profession mechanics', url: 'https://neverwinter.fandom.com/wiki/Profession', publishedAt: null, reviewedAt: JOURNEY_REVIEWED_AT, kind: 'community', limitation: 'Mixed-era page. Its upgrade section explicitly warns that its level gates are obsolete. Old XP tables, tool levels and unsourced capacity numbers are not adopted here.' },
  { id: 'sharandar-demonstration', title: 'Northside: Level 20 to Sharandar demonstration', url: 'https://www.youtube.com/watch?v=3xwjYNyqucI', publishedAt: '2022-05-04', reviewedAt: JOURNEY_REVIEWED_AT, kind: 'community', limitation: 'Demonstrates buying all seven Chultan pairs and Sharandar books. A complete-path demonstration does not prove every purchase is a mandatory gate for a single profession today.' },
  { id: 'menzo-preview', title: 'AsteR: Menzoberranzan and Abyssal Hunts preview', url: 'https://www.youtube.com/watch?v=vKzNukCArpI', publishedAt: '2023-06-10', reviewedAt: JOURNEY_REVIEWED_AT, kind: 'preview', limitation: 'Explicitly recorded on the preview server. Supports the introduction route and location as historical guidance, not a live unlock certification.' },
  { id: 'menzo-workbook', title: 'AsteR: Menzoberranzan Masterwork workbook', url: 'https://docs.google.com/spreadsheets/d/1aWgyXCywEgsT5kN84Zph8BuSnECsR_wXfeLt19bs8yY/edit', publishedAt: null, reviewedAt: JOURNEY_REVIEWED_AT, kind: 'community', limitation: 'Creator-maintained reference. Material routes and book costs are publication evidence; exact live prerequisites, prices and a complete current-game inventory still need checking.' },
  { id: 'event', title: 'Publisher: 2x Professions event rules', url: 'https://www.playneverwinter.com/en/news-details/11519393', publishedAt: '2022-06-21', reviewedAt: JOURNEY_REVIEWED_AT, kind: 'publisher', limitation: 'Event rules are separate from event dates. Check the current in-game calendar; no event is assumed to be active.' },
]
export const journeyPhaseIds = ['foundation', 'first-craft', 'leveling', 'workshop', 'chultan', 'sharandar', 'menzoberranzan', 'preparation', 'production'] as const
export const journeyPhases: JourneyPhase[] = [
  {
    id: 'foundation', navTitle: 'Open your Workshop', title: 'Unlock the Workshop and choose your first profession',
    summary: 'Start with Sergeant Knox at character Level 8. Character level, profession level and Workshop rank are three different progress tracks.',
    milestone: 'You can enter the Workshop and access its crafting tutorial.',
    tasks: ['Reach character Level 8 and accept A Workshop Opportunity from Sergeant Knox.', 'Follow the quest to the Workshop in Protector\'s Enclave and complete its introductory conversations.', 'Choose an initial crafting profession, recruit its artisan and an Adventurer for Gathering.', 'Collect the free Worn tools and follow the tutorial prompts at the Dispatch Board and crafting counter.'],
    sections: [
      { title: 'Your first choice is not permanent', paragraphs: ['The Workshop supports all seven crafting professions plus Gathering. You can develop more professions as you recruit the appropriate artisans; choosing one first does not exclude the others.', 'The Retainer manages the Workshop and introduces its progression. The Dispatch Board sends Adventurers to gather. The crafting counter assigns production to artisans, and the delivery box holds completed work.'], sourceIds: ['level-rework', 'workshop'] },
      { title: 'Keep three levels separate', paragraphs: ['Character Level 8 opens the entry quest. Each crafting profession and its artisans have their own progression to Level 20. Workshop rank changes the premises and its facilities; it is not a profession level or a Masterwork book tier.'], sourceIds: ['level-rework', 'workshop'] },
    ],
    caution: 'Old guides starting at character Level 20 or using profession levels up to 70/80 predate the rescale. Do not use those numbers as current unlock gates.', sourceIds: ['level-rework', 'workshop'],
  },
  {
    id: 'first-craft', navTitle: 'Gather and craft', title: 'Complete the gathering-to-crafting loop',
    summary: 'Learn how materials, tools, artisans, commissions and delivery work before committing expensive Masterwork ingredients.',
    milestone: 'You have gathered an input and collected a successfully crafted item.',
    tasks: ['Choose a Gathering task and assign an Adventurer with the tool required by that task.', 'Collect its output from the delivery box; verify the exact material name and quality.', 'At the crafting counter, choose an unlocked recipe, assign the correct artisan and tool, and review the commission and success chance.', 'Choose timed production or spend Morale for an immediate attempt, then collect and inspect the result.'],
    sections: [
      { title: 'Gathering is its own profession', paragraphs: ['Gathering supplies materials for the seven crafting professions. The task chooses the required tool; do not assume every material uses the same one.', 'Not every input is gathered. Some are crafted intermediates, vendor purchases, explorer-chart rewards or combat drops. The Materials source directory separates these acquisition methods.'], sourceIds: ['workshop', 'menzo-workbook'] },
      { title: 'Know what an attempt consumes', paragraphs: ['The task shows its commission, inputs and chance of success. The community mechanics reference records that failed attempts can lose ingredients and Morale. A selected recipe is not a guaranteed successful output.', 'Timed tasks avoid spending Morale for instant completion, but they still require the task\'s materials and commission. Collect completed work so the delivery box does not prevent further production.'], sourceIds: ['workshop'] },
    ],
    caution: 'Use the live task preview for tool eligibility, capacity, commission and timing. These depend on the task and artisan; no universal fixed cost is assumed.', sourceIds: ['workshop'],
  },
  {
    id: 'leveling', navTitle: 'Level professions', title: 'Build the professions and artisans your recipes need',
    summary: 'The post-rescale cap is Level 20. Progress in the crafting profession does not replace artisan level or the proficiency needed for a difficult recipe.',
    milestone: 'Your intended crafting profession is Level 20 and you understand its supporting professions.',
    tasks: ['Recruit an artisan for each profession you intend to develop, and maintain Gathering for inputs.', 'Choose available recipes using the XP, commission, materials, duration and success chance actually displayed.', 'Upgrade tools when the artisan is eligible and compare the resulting success chance before queuing a large batch.', 'Use the Readiness page to track all seven professions individually; identify any cross-profession intermediates in the recipe tree.'],
    sections: [
      { title: 'A practical leveling loop', paragraphs: ['Compare repeatable recipes rather than assuming the highest-level task is automatically cheapest. Account for purchased inputs, gathering time, commission and failed attempts.', 'Successful crafted and gathered items grant profession and artisan experience. Character experience is a separate system. Exact current Level 1-20 XP thresholds are not verified in this app, so it does not fabricate a precise number of crafts to Level 20.'], sourceIds: ['level-rework', 'workshop'] },
      { title: 'Self-sufficient or specialized?', paragraphs: ['A final recipe can depend on materials made by other professions. Leveling all seven is a self-sufficient production strategy; buying or trading for intermediates may reduce your own crafting work when the items are tradable.', 'A recommended self-sufficient setup is not proof of a mandatory all-seven unlock gate. The in-game vendor and quest requirements take precedence over a guide\'s recommended preparation.'], sourceIds: ['workshop', 'sharandar-demonstration'] },
    ],
    caution: 'No copied pre-2021 XP curve or guaranteed cheapest leveling recipe is used. Market costs and artisan bonuses are not fixed.', sourceIds: ['level-rework', 'workshop'],
  },
  {
    id: 'workshop', navTitle: 'Upgrade the premises', title: 'Progress Workshop ranks and the trading-company story',
    summary: 'Follow the Retainer\'s quests as your Workshop develops. The published Rank 4 credit requirement is 2,500,000, not the old 5,000,000.',
    milestone: 'You know which Workshop improvements you need and the costs you have confirmed in-game.',
    tasks: ['Watch the Retainer for A Clean Start, Trading Company, Lessons Learned, A Box for Knox and the later facilities-upgrade quests.', 'Use Trading Company to learn the commission exchange; inspect Lady Begum\'s currently requested items and credit rewards.', 'Review both normal and high-quality turn-in values before crafting for credits.', 'For The Grand Upgrade, budget the published 2,500,000 South Sea Trading Company Credits, then confirm the active quest requirement before committing items.'],
    sections: [
      { title: 'Ranks are not recipe-book tiers', paragraphs: ['A Clean Start introduces the Rank 2 upgrade; the later facilities upgrade advances Rank 3 and The Grand Upgrade advances Rank 4. A Box for Knox introduces remote interaction with the crafting counter in the community guide.', 'The wiki explicitly marks its old profession-level quest gates as outdated. Exact rescaled triggers and capacity counts need an attributable current source; this journey treats those as requiring confirmation rather than certifying them.'], sourceIds: ['workshop'] },
      { title: 'The credit requirement that changed', paragraphs: ['The July 18, 2023 publisher patch explicitly lowered The Grand Upgrade from 5,000,000 to 2,500,000 credits. That is a Workshop upgrade cost, not an Astral Diamond price for a Masterwork book.', 'Older guides also quote 500,000 credits for the Rank 3 upgrade. Treat that as historical guidance and confirm the current quest. Do not convert obsolete level-60 gates mechanically into a promised current unlock level.'], sourceIds: ['grand-upgrade', 'workshop'] },
    ],
    caution: 'The October 2021 removal of the Artisan\'s old Masterwork storyline does not, by itself, prove every Workshop or guild purchase restriction was removed. Exact live eligibility remains a vendor check.', sourceIds: ['grand-upgrade', 'book-rework', 'workshop'],
  },
  {
    id: 'chultan', navTitle: 'Chultan I & II', title: 'Acquire Chultan Masterwork I, then II',
    summary: 'The ordered book-purchase route replaced the old Artisan quest chain. Start with the profession you plan to craft with and check its vendor eligibility.',
    milestone: 'The intended profession\'s Chultan I and II books are consumed and their recipes appear.',
    tasks: ['Reach Level 20 in the relevant profession and visit The Artisan at a suitable Guild Stronghold.', 'Inspect the first Chultan/Stronghold Masterwork book or choice pack and select the correct profession.', 'Learn I before buying II for that profession; check that the recipes were actually added.', 'Use 500,000 AD per book as the published planning baseline: 1,000,000 AD for a pair or 7,000,000 AD for seven pairs, before any current discounts.'],
    sections: [
      { title: 'Why old Masterwork numbers are confusing', paragraphs: ['The October 2021 notes renamed the old Masterwork IV and V content to Chultan Masterwork and introduced ordered AD book purchases. They removed the old Artisan storyline and changed or removed some resources and recipes.', 'Do not follow an old I-V quest-turn-in walkthrough as though it were the current purchase route. Old ingredients, tool quality bonuses and explorer cases can differ from the updated system.'], sourceIds: ['book-rework'] },
      { title: 'What you can make', paragraphs: ['The contemporary creator demonstration shows Chultan intermediates such as Bronzewood Lumber and Living Bronzewood, and Mastered weapons. Recipe books also need to be checked by profession, not just by the weapon your character uses.', 'The current Vault catalog does not yet contain a verified complete Chultan recipe inventory. Its absence in the browser below is a coverage gap, not a claim that Chultan crafts are unavailable.'], sourceIds: ['sharandar-demonstration', 'book-rework'] },
    ],
    caution: 'Current guild rank requirements and Chultan pack binding remain unverified. Check the exact listing instead of relying on an old rank-10/12/14 guild rule.', sourceIds: ['book-rework', 'sharandar-demonstration'],
  },
  {
    id: 'sharandar', navTitle: 'Sharandar books', title: 'Continue from Chultan into Sharandar Masterwork',
    summary: 'The published Sharandar book price is 1,500,000 AD per profession. The recorded route visits Stryker Bronzepin in New Sharandar.',
    milestone: 'Your chosen Sharandar recipes appear in the crafting counter.',
    tasks: ['Finish the relevant Chultan progression, reach profession Level 20 and check the Artisan\'s next introduction.', 'Follow the introduction to Stryker Bronzepin in New Sharandar.', 'Inspect the chosen profession book, its prerequisites and binding on the character that will use it.', 'Plan 1,500,000 AD per book or 10,500,000 AD for all seven using the published baseline; consume the book and verify your unlocked recipes.'],
    sections: [
      { title: 'Do not confuse demonstrated preparation with a gate', paragraphs: ['Northside\'s May 2022 walkthrough buys both Chultan books for all seven professions before receiving the Sharandar introduction. It demonstrates a complete progression route but does not independently establish the minimum purchase set for every current character.', 'Use the Readiness tracker as your own checklist. It is not an in-game eligibility check and does not grant recipes or share them automatically across characters.'], sourceIds: ['sharandar-demonstration', 'book-rework'] },
      { title: 'Outputs and material routes', paragraphs: ['Browse the captured Sharandar weapons, armor, consumables, supplements and intermediate recipes below. Name-only records stay visible but are clearly separated from recipes whose inputs are captured.', 'Sharandar explorer charts, Vault of Stars material drops, Workshop tasks and vendors feed different recipe chains. Open Where to get on a raw input instead of assuming all materials drop from one activity.'], sourceIds: ['sharandar-demonstration', 'workshop'] },
    ],
    caution: 'Book purchase is only the unlock expense. Tools, artisans, supplements, ingredients, commissions and failed attempts are additional. Published baseline prices are not live vendor quotes.', sourceIds: ['book-rework', 'sharandar-demonstration'],
  },
  {
    id: 'menzoberranzan', navTitle: 'Menzoberranzan books', title: 'Reach the Menzoberranzan Masterwork tier',
    summary: 'Menzoberranzan is the latest tier documented by this catalog, displayed as Underdark in the item browser. That is a coverage statement, not a claim that no later tier exists.',
    milestone: 'The Drow artisan offers the intended book and its recipes are unlocked on your crafter.',
    tasks: ['Review your profession levels and earlier Masterwork books on the character that will craft.', 'Check Stryker Bronzepin for the introduction to the Drow Master Artisan in Narbondellyn.', 'Follow the active quest and inspect the Drow artisan\'s book requirements rather than assuming the tracker proves eligibility.', 'Use the creator workbook\'s 1,500,000 AD per profession as a historical planning baseline, verify the live listing, then learn the chosen book.'],
    sections: [
      { title: 'Requirements that still need confirmation', paragraphs: ['The exact quest name Drow Mastery, all-seven Level 20 requirement and full earlier-book prerequisite set are not independently established as a current minimum gate by the sources reviewed here.', 'The preview walkthrough shows the introduction from Stryker Bronzepin and the Drow Master Artisan in Narbondellyn. Prepare earlier professions as needed, but do not spend on an all-seven prerequisite solely because an unverified checklist says so.'], sourceIds: ['menzo-preview', 'menzo-workbook'] },
      { title: 'The acquisition network', paragraphs: ['Explorer charts, named Abyssal Hunt modifiers, Advanced versus Master Demonweb Pits and campaign-store purchases supply different materials. A chart zone or dungeon difficulty matters: similar material names are not interchangeable.', 'The catalog includes captured equipment, accessories, profession tools, consumables and intermediate recipes. Its source panels distinguish published routes, historical information and unresolved materials.'], sourceIds: ['menzo-workbook'] },
      { title: 'Post-launch corrections matter', paragraphs: ['The November 2023 publisher patch assigns Sharandar and Menzoberranzan alembic recipes to Armorsmithing books rather than the wrongly assigned books. It also fixes Menzoberranzan +1 material designations and their Focus contribution.', 'When a screenshot or older workbook disagrees with a later patch, keep the conflicting record visible for review. Do not silently substitute a different input or treat an unverified yield as confirmed.'], sourceIds: ['tool-correction'] },
    ],
    caution: 'Exact current prerequisites, binding and vendor prices are not certified by a preview or a recently crawled old guide. Read the current in-game book and quest before buying.', sourceIds: ['menzo-preview', 'menzo-workbook', 'tool-correction'],
  },
  {
    id: 'preparation', navTitle: 'Prepare a reliable craft', title: 'Match artisans, tools and supplements to the recipe',
    summary: 'Unlocking a book gives recipe access. It does not guarantee success or a high-quality result.',
    milestone: 'You have checked the success chance, quality chance, commission and eligible tool for your intended craft.',
    tasks: ['Choose an eligible artisan and tool and read the resulting Proficiency and success chance.', 'Check minimum Focus and the displayed high-quality chance separately from success chance.', 'Compare supplements and +1 inputs where the task allows them; verify the exact final quality required.', 'Include commission modifiers, speed, special skills and the cost of potential failed attempts in your plan.'],
    sections: [
      { title: 'Proficiency and Focus solve different problems', paragraphs: ['Proficiency relates to completing the craft successfully. Focus relates to the quality of the result after an eligible task is attempted. A successful ordinary result is not the same as a +1 result.', 'The task preview is the final check for the combined artisan, tool, supplement and input-quality contribution. Do not interpret a 100% success preview as a 100% high-quality preview.'], sourceIds: ['workshop', 'tool-correction'] },
      { title: 'Tools, special skills and costs', paragraphs: ['A tool has its own artisan-level eligibility. A higher stat tool does not remove a profession/book requirement. The publisher changed old Masterwork tools in 2021, removing the old +40% quality description and adding a 10% Recycle skill.', 'Artisan commission and speed modifiers affect different costs. Special skills such as Recycle or Dab Hand are conditional chances, not guaranteed rebates or a reason to double all recipe yields in the planner.'], sourceIds: ['workshop', 'book-rework'] },
      { title: 'Daily Morale and events', paragraphs: ['The community reference records a 400-point daily Morale budget. Timed work and instant Morale-spending work are separate options.', 'Use the current event calendar and task preview to check Professions event behavior. This guide does not assume that a 2x event is running or that every reward and experience value doubles.'], sourceIds: ['workshop', 'event'] },
    ],
    caution: 'No fixed artisan purchase price, universal best tool, guaranteed bonus proc or guaranteed profit is asserted. Use the task preview for the exact combination you have.', sourceIds: ['workshop', 'book-rework', 'tool-correction', 'event'],
  },
  {
    id: 'production', navTitle: 'Craft from the full plan', title: 'Turn recipe access into a finished Masterwork item',
    summary: 'Choose a captured recipe, expand the dependencies, subtract inventory and make the intermediates in order before the final craft.',
    milestone: 'You have inspected the completed item, including its exact quality and binding.',
    tasks: ['Open the desired craftable below and inspect its captured inputs, output yield and evidence status.', 'Add final items to Plan and set their quantities. Shared intermediate batches can serve more than one final craft.', 'Enter owned materials in Inventory, then use the acquisition checklist and Where to get guides for the remaining inputs.', 'Follow the dependency-ordered Profession dashboard from intermediates to final items; inspect the resulting quality before equipping, selling or trading.'],
    sections: [
      { title: 'All captured craftables, not only weapons', paragraphs: ['The recipe browser below includes every final-item record and intermediate recipe in the current catalog. Filters cover era, profession and item type; missing recipes are not hidden.', 'A recipe with an unconfirmed yield is not promoted to verified by a calculation. Existing screenshot-backed quantities are preserved, and source uncertainty travels with the record.'], sourceIds: ['menzo-workbook', 'tool-correction'] },
      { title: 'Count attempts and outcomes separately', paragraphs: ['The Plan calculates required recipe batches and material requirements. Actual attempts can exceed successful batches when crafts fail; special-skill outcomes are not guaranteed.', 'Track what you have actually collected. Check tradability and the quality required before substituting market purchases, because acquisition guidance does not imply every item is tradable.'], sourceIds: ['workshop'] },
    ],
    caution: 'The current catalog covers Underdark/Menzoberranzan and Sharandar records, not a verified exhaustive list of every regular, Chultan or later game recipe. The coverage panel identifies those gaps explicitly.', sourceIds: ['workshop', 'menzo-workbook'],
  },
]
export const journeyProfessionGuides = [
  { name: 'Alchemy', role: 'Potions, elixirs, supplements and processed reagents', url: 'https://neverwinter.fandom.com/wiki/Alchemy' },
  { name: 'Armorsmithing', role: 'Armor, processed materials and Masterwork alembics', url: 'https://neverwinter.fandom.com/wiki/Armorsmithing' },
  { name: 'Artificing', role: 'Magical implements and worked organic materials', url: 'https://neverwinter.fandom.com/wiki/Artificing' },
  { name: 'Blacksmithing', role: 'Metal weapons, metal components and tools', url: 'https://neverwinter.fandom.com/wiki/Blacksmithing' },
  { name: 'Jewelcrafting', role: 'Jewelry, gems and worked ornaments', url: 'https://neverwinter.fandom.com/wiki/Jewelcrafting' },
  { name: 'Leatherworking', role: 'Leather equipment and processed hides', url: 'https://neverwinter.fandom.com/wiki/Leatherworking' },
  { name: 'Tailoring', role: 'Cloth equipment, fibers and woven materials', url: 'https://neverwinter.fandom.com/wiki/Tailoring' },
  { name: 'Gathering', role: 'Adventurer tasks that supply crafting inputs; not an eighth Masterwork book tier', url: 'https://neverwinter.fandom.com/wiki/Gathering' },
] as const
