# Masterwork Vault — SEO operations and measurement

## Scope / release philosophy

The indexable knowledge hub at \`/guides/\` is generated during \`npm run build\` from the same item/material data used by the crafting app. It is **not** a separate invented recipe database. The dynamic app continues to serve interactive planning and personalized state. Source-based, public HTML pages are navigable without JavaScript and use unique titles, canonical URLs, HTML body copy, and BreadcrumbList structured data. No made-up ratings, prices, HowTo or culinary Recipe structured data.

## Production and preview verification

1. Run \`cd app && npm install && npm run build && npm run verify:seo\`.
2. Run \`npx playwright test tests/seo-pages.spec.ts\`.
3. After deploying, inspect \`https://neverwintermastercraft.netlify.app/guides/\`, one recipe page, one material page, and \`/sitemap.xml\` using both a normal browser and "View Source". Check the HTTP status and unique canonical, metadata and actual visible content.
4. Confirm \`/catalog\`, \`/materials\`, \`/reference\`, \`/journey\` initially contain route-appropriate metadata. The personal \`/plan\`, \`/readiness\`, and other utility pages remain noindex. Deep app item URLs under \`/catalog/*\` have an X-Robots-Tag noindex to avoid duplicate guide pages.
5. Use [Google Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/) to validate the JSON-LD. \`WebPage\` and \`BreadcrumbList\` are descriptive, not promises of rich snippets.
6. Check representative pages with Lighthouse, a real mobile device and [PageSpeed Insights](https://pagespeed.web.dev/). Optimize LCP, INP and CLS based on measured results. Guide pages are intentionally script-free, while the interactive app remains code-split.
7. Keep historical material source disclaimers and verify changes against in-game evidence before claiming current drops, map positions or costs.

## Search Console: owner action required

- Visit [Google Search Console](https://search.google.com/search-console/) and add the URL-prefix property \`https://neverwintermastercraft.netlify.app/\` (or a domain property if a custom domain is in use).
- Obtain Google's HTML tag verification content and set the Netlify environment variable \`GOOGLE_SITE_VERIFICATION\` to the **token only**. Rebuild/deploy so the server-delivered HTML includes it. Never commit a Google account token to the repository.
- Verify ownership inside Search Console. Submit \`https://neverwintermastercraft.netlify.app/sitemap.xml\`. Inspection and sitemap submission do **not** guarantee indexing.
- Inspect a guide directory, a recipe guide and a source guide, and compare Google's selected canonical to the one emitted by the site.
- In Search Console, inspect Page indexing, Core Web Vitals and Performance monthly. Track indexed guide pages, organic clicks, impressions, click-through rate and search queries over meaningful 28-day or 3-month periods.

## Baseline and ongoing reporting

No current Search Console property or historical organic traffic dataset was provided, so no baseline traffic or growth claims are made.

Export Search Console **Performance > Search results > Pages** as CSV (use the same date and search type each time). Run:
\`node scripts/analyze-search-console.mjs /path/to/Pages.csv\`

The command groups measured impressions and clicks for recipe guides, material guides, the catalog and other pages; it prints pages with the largest impression volumes for follow-up work. Treat exported totals as data from the selected Search Console report, not total site sessions or guaranteed complete search traffic.

Suggested monthly baseline fields: export date, date range, published guide count, indexed guide count, total clicks, impressions, CTR, average position, top landing pages, high-impression/low-CTR pages, mobile CWV issue counts. Record zero **only when a real report says zero**; otherwise use "unknown".

## Analytics and privacy

This project deliberately does not silently add Google Analytics tracking. If GA4 is later desired, provide a real measurement ID, publish a clear privacy notice, implement consent according to relevant requirements and then test that events fire only when permitted. Search Console organic-search metrics are usable without adding a client-side analytics script.

## Source documentation

- https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- https://developers.google.com/search/docs/monitor-debug/search-console-start
