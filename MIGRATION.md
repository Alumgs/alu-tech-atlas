# Migration audit

Source: Sites release 9, commit `6d8213f74ba9ee9f8485fa67b33b97b224a17f56` (mobile edition).
Destination: `Alumgs/alu-tech-atlas`, main, Worker `alu-tech-atlas`.

Copied complete app/components/hooks/lib/public/vendor source trees. Content and illustrations preserved. Removed the unused ChatGPT authentication helper and Sites-only build/runtime glue; retained package versions and lockfile. Added standalone password gate, CI/CD, session-expiry handling, tests and setup documentation.

Changes intentionally excluded: knowledge-studio private assets/database, shared authentication, unverified publish feeds, GitHub repository visibility, original Sites deletion, custom DNS changes.

Source correspondence: `app/portal.tsx` adds logout only; `hooks/use-updates.ts` additionally redirects expired sessions to login; `app/layout.tsx` removes the preview-only metadata. All knowledge entries, research source directory, case model, report generator, styles and image content are copied unchanged.

## Verified locally

- 6 authentication unit tests passed.
- TypeScript and full Worker production build passed.
- Wrangler dry run: approximately 389 KiB gzip.
- Local workerd smoke passed: anonymous page/asset redirects, API 401, cross-origin login rejection, successful password login, home/case/knowledge/image responses, source index validation, feed contract and logout.
- External TechCrunch collection failed because this test environment cannot resolve its domain; a structured failure status was returned. Live source success is not claimed.
- No graphical browser/mobile interaction test was available.

## Outstanding external actions

The destination repository is being migrated atomically from its existing V3 Pages tree to this V4 Worker source. A pre-migration backup ref is created before the production `main` ref is replaced. Cloudflare deployment additionally requires the three repository Actions Secrets described in README.
