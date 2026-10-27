# Atlas 4.2 — Information and language design

The production system remains GitHub main → GitHub Actions → Cloudflare Worker. Password access, the existing KV settings, knowledge articles, case studies and report exports are retained.

## Reading model

- Four views at the top: World briefing, AIDC, Robotics, Machine learning. World coverage is separate from professional research; world stories are excluded from professional report exports.
- Main news views and research reports share one source directory (`SourceDirectory`). Institutional groups can filter the main stream. A successful group fetch is not presented as a hit for every institution.
- The 48-hour highlights rank events already collected by this site. Independent publishers count once; weight halves after 24 hours. This is coverage-dependent attention, not a universal news ranking or a truth score.
- Recommended / latest / trending, subject filters, reading state, bookmarks and reporting timelines are retained. Versions, quarters and different quantitative results stay separate. Grouping is conservative title matching, not a semantic model verdict.
- Direct RSS and Google News institutional indexes are explicitly distinguished from data APIs and reference-only links. No paywalled or authenticated full text is claimed.
- Original publication dates govern time filters. Collection time never makes an old article “today”. Source errors and stale caches remain visible.

## Languages

中文 / EN / 中英对照 is a browser-local preference shared across pages. Core navigation has a reviewed dictionary; news snippets and handbook prose are translated only as they become visible. The original appears immediately. Translation never blocks navigation, news collection or report generation.

The authenticated same-origin POST `/api/translate` accepts bounded text batches and uses the existing Workers AI binding with the dedicated M2M100 translation model. Translation results are content-addressed in existing KV for 30 days. Numeric tokens must remain unchanged; failure leaves the original visible. Translations are labeled as machine generated. The existing `enableAIEnrichment` setting controls this feature too. No new API key is required.

## Reference

Inspired by the collection → selection → event grouping → trends → reports flow described in [AIHOT](https://github.com/KKKKhazix/AIHOT), particularly `README.md` and `docs/architecture.md`. Implementation is adapted to Atlas and Cloudflare; no AIHOT code, source roster, brand or logo is copied. Atlas continues to use deterministic ranking rather than presenting model-generated scoring as verified facts.

## Verification

TypeScript, existing regression tests plus world-stream/provenance/translation tests, production build and Wrangler deployment dry run. The dedicated translation model was checked against the connected Cloudflare account. Managed browser preview requires a Cloudflare credential unavailable in the preview runtime; no authentication bypass is added for testing. CI performs production health and authenticated route checks when its configured password is current.

## Relevance correction (2026-10-27)

Content gates run before source/recency ranking: fixed-domain feeds no longer bypass topic checks. Classification uses title/snippet evidence, never publisher or feed names. Generic earnings, model, agent, network and infrastructure terms are insufficient on their own. Old browser snapshots are revalidated and world categories recomputed.

Default professional selections require direct title evidence and at least 25 characters of source snippet. Summary-only domain evidence remains available under “All relevant updates”; rejected material cannot re-enter through sorting, hot cards or saved views. World filters and card labels use one principal category, title first and snippet only if inconclusive, with English word boundaries. World has no duplicate content-type taxonomy or professional subnavigation. This is a deterministic layered gate inspired by AIHOT's prefilter/selection separation, not its independent double-LLM scoring pipeline. It can miss unusual terminology; no semantic accuracy percentage is claimed. Regression fixtures cover the supplied screenshot's displaced-persons and UN anniversary stories, generic business leakage, old categories and fixed-feed bypasses.

## Domestic feeds and subject/form separation (2026-10-27)

World topics now live in `worldCategory`; `type` independently preserves policy, financial briefing and community-discussion forms. Region can come from a declared domestic feed, so China filtering does not depend on the headline saying “China”. Government, China News Service, Zhihu public hot-list JSON and Tonghuashun public financial JSON are supported; no third-party RSSHub dependency is required. Fetch rejection remains visible. Zhihu uses the original question creation timestamp and exact string ID from its URL, never collection time or rounded JSON numeric IDs. Community discussions stay outside selected briefs. The same domestic feeds have professional variants which still require domain evidence.

Briefs require source-tier score thresholds, material, direct professional title relevance, no stale data, and at most two stories per publisher / twelve total. Official policy originals can lack a snippet. Both scope buttons show their counts and explain admission. Per-feed filters expose actual collected coverage. Macro institutional indexes now include investment banks/consulting and private capital as well as asset managers and policy bodies, but an index configuration does not imply successful collection of every listed institution.

## International coverage and issuer news (2026-10-27)

World defaults to all relevant reports and recommendation ordering interleaves subjects/publishers so fast financial alerts cannot occupy every first-page slot. Explicit latest and heat sorts remain ordered by their chosen metric. World navigation resets region to global, and direct world feeds run before slower institutional search indexes. BBC, UN and company-source coverage chips show visible counts plus actual fetch status. World subject types receive comparable reading-priority weights rather than the generic fallback score.

Anthropic's public newsroom is parsed from dated HTML listing rows, with at most two missing snippets fetched from its fixed official host. Calendar-only dates remain calendar-only dates; missing dates are excluded. Both world and ML versions are configured, alongside direct Verge and world TechCrunch feeds. Company names and capital-market event terms (IPO/S-1/public offering) are recognized by relevance/topic routing. The IPO is not hardcoded into the news array. Deployed smoke checks now exercise BBC and both official newsroom scopes and log matching capital-market notices.
