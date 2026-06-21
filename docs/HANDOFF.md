# Handoff

## Current Status

FixMySEO MVP is deployed on a Hostinger VPS and served through:

```text
https://customaichatbot.online/
```

GitHub repo:

```text
https://github.com/pranavmangla83-stack/seo-project.git
```

Current branch:

```text
main
```

Latest pushed commits:

```text
7f1ed77 Fix scan URL submission validation
f08929c Update project handoff
efb9f79 Group repeated report title issues
7837280 Show scan issues in report fixes
a5a6ec4 Redirect scans to report page
bb212db Track invalid scan URL attempts
5017378 Add SEO report UX and resolution engine
```

The local branch is currently even with `origin/main`. Remaining untracked local files are disposable dev logs and reference screenshots:

```text
.next-dev-3002.err.log
.next-dev-3002.out.log
docs/image.png
docs/image-1.png
docs/image-2.png
```

Do not stage those unless the user explicitly asks.

## Latest Session Summary

The user wanted the report UI to match a v0-style premium SEO audit report and asked for iterative changes before and during coding.

Completed and pushed:

- Homepage was restyled to match the cleaner report visual language.
- Scan flow now redirects to a dedicated report page after completion.
- New report route:

```text
/reports/[scanId]
```

- Report page now uses a premium business-report layout.
- Top fixes now include both generated `seo_resolutions` and raw prioritized `scan_issues`, so title/meta findings appear again.
- Repeated weak title and weak meta description issues are grouped into one card per issue type.
- Grouped title/meta cards list affected pages with page label, current title/description text, and character count.
- Invalid URL attempts are logged as `scan_failed` events with `metadata.reason = "invalid_url"`.
- Temporary scan URL submission monitoring is enabled until `2026-06-28`. Invalid and started scan events include `metadata.submit_debug` with input lengths and state/form match status.

Delete temporary monitoring data after `2026-06-28`:

```sql
delete from public.events
where metadata->'submit_debug'->>'temporaryReason' = 'scan_url_submission_monitoring';
```

Recent local report smoke test:

```text
http://localhost:3000/reports/55e7fb90-bd97-4587-8c8e-2d283058f501
```

This route returned `200`.

## Report UX Status

The dedicated report page is intended to feel like a premium SMB business SEO report, not a developer dashboard.

Current `/reports/[scanId]` includes:

- Sticky top bar with report actions.
- Report opening section with diagnosis, score, and plain-English business meaning.
- "Your top fixes, in order" as the second major section.
- Fix cards with priority, issue area, effort, verification state, Problem section, and "Use this" recommendation section.
- Grouped weak page title cards, for example:

```text
Improve page titles on 2 pages
```

- Grouped weak meta description cards, for example:

```text
Improve page descriptions on 3 pages
```

- Affected page rows inside the Problem section, for example:

```text
About
18 characters - About Us - Eduluck
```

- The older "before vs recommended" side-by-side block was removed per user request.

Frontend/report UX work should follow:

```text
workflows/report_frontend_ux.md
```

## Scan Flow Status

The homepage scan form accepts plain domains like:

```text
example.com
www.eduluck.in
```

After a scan completes, the frontend redirects to:

```text
/reports/{scanId}
```

This replaced the older inline homepage report behavior.

## Resolution And Issue Data Status

The report top fixes now merge two sources:

- `seo_resolutions` from:

```text
GET /api/scans/[scanId]/resolutions
```

- prioritized `scan_issues` passed from:

```text
app/reports/[scanId]/page.tsx
```

The merge exists because some important raw issues, especially weak title and meta description issues, may not become generated resolution records.

Important files:

```text
app/reports/[scanId]/page.tsx
components/resolution-fixes.tsx
components/scan-form.tsx
app/api/scans/route.ts
app/globals.css
```

## Validation Completed

Recent checks passed:

```powershell
.\node_modules\.bin\tsc --noEmit --incremental false
.\node_modules\.bin\eslint components/resolution-fixes.tsx app/reports/[scanId]/page.tsx
```

Recent report route smoke test:

```text
STATUS=200
```

Earlier in the work, report/API checks and build checks also passed after the larger report implementation.

## Deployment Notes

Hostinger VPS path:

```text
/var/www/fixmyseo
```

PM2 app name:

```text
fixmyseo
```

App port:

```text
3001
```

Common VPS deploy command:

```bash
cd /var/www/fixmyseo
git pull origin main
npm run build
pm2 restart fixmyseo --update-env
pm2 save
```

If `git pull` asks for a GitHub password, HTTPS password auth will fail. Use a GitHub token or SSH deploy key.

Production needs Node.js 22+ because the current Supabase client stack failed on Node 20 without native WebSocket support.

## Analytics And Tracking

Custom events include:

- `scan_started`
- `scan_completed`
- `scan_failed`
- `fix_cta_clicked`
- `lead_form_submitted`
- `lead_captured`
- `lead_form_failed`
- `pricing_viewed`
- `pricing_market_changed`
- `pricing_plan_clicked`
- `pricing_interest_saved`
- `pricing_plan_save_failed`
- `resolutions_planned`
- `resolution_planning_failed`
- `resolution_planned`

Invalid homepage URL submissions now create `scan_failed` events with an `invalid_url` reason, which helps explain Microsoft Clarity sessions where users typed hidden/password-like or malformed input.

Use `lead_captured` as the main Google Ads conversion once enough data exists. Do not use `scan_failed` or ordinary `page_view` as the main conversion.

## Secrets

Do not print, commit, screenshot, or expose `.env.local`.

Supabase database/service credentials appeared in local/private IDE context during earlier work. Rotate Supabase credentials if there is any doubt about exposure outside the local/private environment.

## Next Recommended Work

1. In the next chat, read:
   - `docs/AI_CONTEXT.md`
   - `docs/MVP_PRD.md`
   - `docs/build_rules.md`
   - `docs/HANDOFF.md`
   - `workflows/report_frontend_ux.md` if touching report/frontend UX
2. Deploy latest `main` to Hostinger.
3. Scan `www.eduluck.in` again on production and confirm it redirects to `/reports/[scanId]`.
4. Visually inspect the grouped title/meta cards on desktop and mobile.
5. Submit a real scan, email, and pricing click to confirm GA4/Supabase events.
6. Start ads only after scan completion and report experience are reliable.

## Suggested Skills

- `diagnose` if scan, Supabase, deployment, or report behavior breaks.
- `ai-context` after major product, deployment, analytics, or architecture decisions.
- `github:yeet` when pushing selected local changes.
- `handoff` before switching sessions or agents.
- Higgsfield skills only when the user explicitly asks to use Higgsfield.
