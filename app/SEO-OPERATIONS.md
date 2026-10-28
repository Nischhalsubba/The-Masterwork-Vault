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

## Verification work following PR #65 (October 28, 2026)

### Mobile performance follow-up

Issue [#66](https://github.com/Nischhalsubba/The-Masterwork-Vault/issues/66) tracks the mobile catalog bottleneck. The original main-commit Lighthouse result was Performance 75, LCP 4,115 ms, CLS 0.000 and TBT 252 ms. The catalog's mobile LCP element was the first explanatory paragraph. Tests for optional UI module loading and Lighthouse before/after measurements are release gates for this follow-up; do not assert a faster result until a fresh lab run exists.

### Field Core Web Vitals data classification

`node scripts/audit-field-cwv.mjs` queries public PageSpeed Insights for the catalog and guide index on mobile and desktop. The optional `PAGESPEED_API_KEY` must be provided only through a secure CI/hosting environment, never committed or printed. The request attempts bounded retries for HTTP 429 and transient server errors.

The output distinguishes `field-data`, `rate-limited`, `insufficient-public-field-data`, `access-denied`, and `unavailable`. It records whether available figures are URL-level or origin-level and, where present, the PageSpeed analysis timestamp. Raw PSI CLS percentile values are in score × 100 units and must be normalized before comparing with the 0.1 CLS threshold. The timestamps and observation period of field data must not be conflated with Lighthouse lab runs.

### External source-reference reachability

`node scripts/audit-external-references.mjs` scans the generated public guides and writes a deduplicated, page-mapped report to `link-audit-results/external-references.json`. The SEO CI workflow uploads that file as an artifact. HTTP 403/429/503, bot challenges and network failures remain inconclusive, not confirmed broken links. HTTP 200/redirect merely establishes reachability, **not** that the linked Neverwinter information still supports the specific acquisition claim. Inspect affected source pages manually before correcting source records.

### Release and account-access gates

Run the full Playwright regression and SEO/security workflows before merging performance changes; compare mobile and desktop Lighthouse runs under matching conditions. The deployed app must be rechecked after release. Search Console property verification, sitemap submission and indexing reports remain owner-access tasks unless an authorized connector is available. Do not claim that 188 crawlable guide URLs are 188 Google-indexed pages.
