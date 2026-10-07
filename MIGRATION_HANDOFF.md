# Alu Tech Atlas V4 migration handoff

This package is the cleaned V4 source for `Alumgs/alu-tech-atlas`.

Production architecture:
- GitHub `main` is the single source of truth.
- GitHub Actions runs validation/build/deploy.
- Cloudflare Workers serves the V4 app and API.
- The old GitHub Pages V3 files should be removed as part of the atomic migration.

Required GitHub Actions secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `ATLAS_ACCESS_PASSWORD` (12–256 characters)

Optional repository variable:
- `ATLAS_BASE_URL` if the Worker uses a URL other than the configured default.

Do not commit real credentials or `.dev.vars`.
