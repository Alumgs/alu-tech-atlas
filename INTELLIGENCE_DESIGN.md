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
