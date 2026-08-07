# The Masterwork Vault

A responsive Neverwinter Menzoberranzan Masterwork crafting guide focused on the fixed raw-material cost of craftable gear.

## What it does

- Browse class-specific weapons and armor, with global accessories.
- View direct recipes from the final screenshot evidence.
- Expand recipes all the way to raw materials.
- Apply craft-yield batch rounding and show leftovers.
- Combine multiple items into one crafting plan.
- Use real screenshot-derived item, material, accessory and profession-tool crops.
- Preserve source provenance and evidence links.

## Source precedence

1. Latest user-provided correction screenshots.
2. Final organized `Underdark Masterwork.zip` screenshots.
3. Spreadsheet supplemental data only when the final screenshots do not contain the field.

Commission, proficiency and focus are not used in cost calculations. In this project, **crafting cost means raw materials required**.

## Current resolved corrections

- Cleric Steel Symbol: 3 Living Fungi, 2 Lacquered Mushroom, 2 Soul Bead, 2 Unknown Godsteel, 1 Hardened Mushroom.
- Cleric Steel Icon: 3 Marilith Charm, 4 Unknown Godsteel, 1 Soul Bead, 1 Spool of Marilithsilk.
- Soul Bead: final-ZIP updated recipe observation using 6 Fallen God's Ore; output 2.

## Development

```bash
npm install
npm run dev
npm run build
```

## Deployment

Pushes to `main` run the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`.
