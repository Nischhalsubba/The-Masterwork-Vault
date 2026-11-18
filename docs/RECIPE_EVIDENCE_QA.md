# Masterwork recipe evidence and dependency QA

The Masterwork Vault is a Neverwinter crafting reference, not an authoritative live-game API. Each recipe's output, profession, inputs, quantity, source and game version must be reviewable independently.

## Required provenance

For each new or changed recipe, record:

1. Exact item and recipe names, profession and crafting tier/requirements.
2. Output quantity, ingredient names and quantities, including nested materials.
3. Original source URL or captured in-game screenshot, observation date and platform/patch when known.
4. Whether the evidence describes a current recipe, historical recipe or incomplete research lead.
5. Any uncertainty, conflicting sources, derived conversion or manually transcribed field.

Do not infer an ingredient quantity from image proportions, fill missing tiers with invented data, or present a variant as equivalent without evidence.

## Dependency graph acceptance

- Verify that each ingredient points to the correct canonical item/recipe.
- Inspect repeated ingredients, alternative variants, branching chains and any explicitly unresolved dependencies.
- Ensure zero/negative quantities, orphan references and unintended cycles are not silently accepted.
- Compare displayed totals with the source record, including intermediate material aggregation.
- Make incomplete or unverified nodes visibly distinct from verified recipe steps.
- Test search/filter/navigation to and from a deep recipe, including narrow screens and keyboard operation.

## Local command surface

Use Node.js 24.x and the npm version declared by \`app/package.json\`. From \`app/\`:

~~~bash
npm install
npm run verify:sources
npm run verify:recipes
npm run verify:knowledge
npm run test:domain
npm run build
~~~

\`npm run build\` includes release verification, TypeScript and the Vite bundle. For UI or interaction changes run \`npm run test:e2e\` with supported browsers. Passing scripts is not proof that external recipe claims were independently source-verified.

## Pull request evidence checklist

Provide changed recipe/item identifiers, exact sources and dates, a before/after ingredient table, resulting dependency-graph behavior, automated command results and remaining unverified facts. When an existing fact is corrected, retain a concise historical note rather than silently rewriting the source trail.

## Rollback

Revert the smallest incorrect item relationship and re-run the graph/source checks. Do not continue publishing derived material totals based on a source relationship known to be wrong.
