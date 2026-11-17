# Atlas Global Calendar

User scope: seven inclusive Beijing calendar days of previews; historical months from 2026-11 without a rolling deletion window. The world briefing switches in place to `/?domain=aidc&view=calendar`; legacy `/calendar` redirects there. The calendar stays mounted after first use, retaining selection, filters and records. News collection pauses while the calendar is active; cached news remains in memory. Range snapshots coalesce concurrent reads and restore recent windows; refresh checks only due sources unless explicitly forced. Stored event detail/history loads independently of external verification. Existing credentials, sessions, news feeds and reports are retained.

## Durable event records

`CALENDAR_DB` binds the dedicated `atlas-global-calendar` D1 database (APAC). The tracked migration is idempotent and was applied to that database before deployment. `calendar_events` stores current snapshots; `calendar_versions` appends meaningful revisions; `calendar_source_state` stores independent attempt/success status and short request leases. No event or history TTL/delete job exists. A source removing old records never deletes our archive. Historical views include pointers at former dates even when the event moved within the same month. Query each month back to November 2026; available history grows automatically with time. The archive is not claimed to be globally complete.

Backfill was obtained from live official and institutional schedules on 2026-11-16. No simulated design entries were imported. Company RSS `pubDate` is never an event date. Q4 details supply explicit event time/zone when present; otherwise the listing remains date-only. NBS Word-table rowspans are expanded before selecting month/time cells. BLS timezone IDs are normalized to IANA zones and DST-aware instants. Eurostat's source timestamps are preserved, including original UTC offset. IFES is institution-sourced and is not labeled as an election authority's confirmation.

## Refresh and results

On entry and tab visibility, refresh source groups of at most three; explicit event opens refresh the corresponding source then check available result evidence. Thirty-second minimum coalescing applies even to forced calls. The scheduled handler runs every 30 minutes, with the same persistent source leases. Fetches have fixed allowlisted origins, bounded bodies and explicit timeouts. Source failures retain records and last-success timestamps, with failures visible in the coverage panel. A successful empty RSS schedule is distinguishable from a failure.

Elapsed time never marks an event completed. Explicit official material links can mark a record as published; otherwise past events remain "result pending verification". On-demand NBS/BLS result checks require an exact original release-date match before saving a bounded source excerpt. A newer CPI release cannot overwrite a prior month's historical result. Election outcomes are not inferred from the voting date. No market consensus, returns, or numerical forecast is fabricated. Future enhancements can add more official result adapters and company feeds; current coverage is enumerated in the UI, including zero-entry feeds.

## Operations and validation

The existing GitHub Actions flow builds and deploys the original Worker. The source Wrangler configuration preserves the auth/KV/AI setup and adds the D1 binding and cron. `worker-bindings.d.ts` is generated with the installed Wrangler. SQL schema upgrades should be applied to this specific D1 database before code that requires them; do not use the unrelated ALU PLAY database.

Tests cover seven-day windows, unbounded-age monthly archive lookup, DST/cross-day conversion, date-only precision, NBS table alignment, RSS publication-vs-event dates, SQLite-backed revision idempotency and rollover retention, rescheduling pointers, result-date matching and evidence persistence. Production smoke checks exercise authenticated `/calendar`, each source group, stored future/historical records and event versions. Managed browser preview was blocked by missing remote AI credentials; this is a visual QA limitation, not a production authentication change.


## Network-path resilience

The deployed Worker exposed two environment-specific issues: edge fetch supports manual/follow redirects, not redirect:error; Microsoft has a same-origin redirect. Redirect handling is now bounded and manual. BLS denies edge-network access; an independent GitHub Actions runner downloads only the public official BLS ICS and sends it through a same-origin, session-protected, administrator-password-confirmed import route restricted to BLS. It runs after deployment and on a half-hour schedule using the existing CI site credential. No new credential is disclosed or stored in source. If the current site password is changed, the matching Actions credential must remain current for this runner. The ordinary Worker cron and source checks still work independently.

When edge fetch fails but an independently verified snapshot is under an hour old, the UI labels it as a fallback snapshot and retains its real last-success timestamp; the failed direct attempt never advances that timestamp. Otherwise the source reports failure and retains its archive. The official alternate BLS host is also attempted; no third-party proxy or anti-bot challenge bypass is used.

## 4.3.1 coverage expansion

Chinese sources now include NBS, official JD/NetEase/Baidu/PDD releases, Alibaba structured investor events, Tencent investor activities, China Money LPR rules and government policy originals. APEC official dates classify China-hosted events in the China filter, preserving multi-day durations. Announcement dates never substitute for event dates. Alibaba earnings release and conference call are separate records. Published Chinese earnings override their own prior schedule regardless of feed order. Government policy collection checks up to six latest original policy documents for explicit effective dates; relative/ambiguous dates are excluded. The LPR monthly rule produces only a conspicuously tentative date-only window, with no inferred holiday adjustment, precise clock or rate forecast. Source health and zero matches are distinct. This expands verified coverage and does not claim a complete world calendar.

Performance evidence: eliminated document navigation between the portal and calendar; removed duplicate initial snapshot fetches; reuse mounted calendar state; pause hidden source work and render saved history before slow source checks. No browser performance trace was available, so no measured latency percentage is claimed.

## 4.4 compact presentation and real weekend coverage

Replaced the calendar hero with a compact title/tool area, smaller date columns and a single-column agenda until an event record is opened. News pages use one primary title, a compact ranked highlights list, collapsed coverage/advanced controls and expandable source directories. Existing language switching, filters, archives, source health and original references remain accessible. Calendar search now uses the shared portal search field. Hidden mounted views and controls remain hidden even when component styles declare display.

Calendar display groups exact same-country/category/date/time/period titles, including original entries with regenerated feed UIDs. Every original ID and revision ledger remains stored and accessible. Alibaba's explicitly linked earnings announcement and call share one display card, preserving the call's precise timestamp in related activities. Other different clocks, periods or dates stay separate. World news copies can group across internal domain attribution and strip known publisher suffixes; version and numeric checks remain conservative.

Added the NATO Parliamentary Assembly official calendar. EU Council rejects both edge and independent-runner requests with HTTP 403; its official calendar remains a clearly labeled reference link and is excluded from automatic source counts. Multi-day meetings retain their actual start/end range and show as ongoing on later days. Current 17–23 Nov coverage includes genuine weekend meetings; no fabricated daily event or publication-date filler is used. API provides per-day starting/ongoing coverage, raw count and merged count. Coverage is not a promise that every future date or country has a confirmed major event.

Managed browser preview is blocked by missing local credentials for the existing remote AI binding. No browser screenshot or measured visual result is claimed. Type checks, unit tests, builds and authenticated deployment smoke checks validate the available contracts.
