# AI Context

## Project Overview

Project Name: FixMySEO
Stage: MVP deployed on Hostinger VPS, in early validation/launch QA
Main Goal: Validate whether small business owners want a simple SEO scanner that identifies website issues and shows intent for one-click fixes.

## Target Customer

Who this is for: Small business owners with simple websites.

Problem they have: They want more Google traffic, but SEO feels expensive, technical, and time-consuming.

Why they would care: FixMySEO promises to scan their website, show what is hurting SEO, and make fixes feel simple.

## MVP Scope

Included:

- Neutral/global landing page with website URL input
- Website scan of up to 5 pages
- Rule-based detection for the first SEO issue set
- Sitemap-assisted page discovery for the scan limit
- Page importance classification for SMB-relevant pages
- Issue prioritization with business impact, fix difficulty, confidence, page importance, and priority score
- AI explanations and suggested fixes
- MVP Issue Resolution Engine that turns the top scan issues into resolution records
- AI-generated resolution output for missing titles, missing meta descriptions, and missing H1s
- Dedicated premium-style report route at `/reports/[scanId]`
- Top fixes UI that presents generated resolution output as a business-friendly action plan
- Free report preview
- "Fix these issues for me" CTA
- Email capture after CTA click
- Fake-door pricing page with India | US toggle
- Launch-soon confirmation after pricing click
- Supabase storage for validation data and funnel events
- Google Ads as the first launch channel
- Landing page with three scroll sections: scanner hero, value explanation, and India pricing preview
- Progress UI while scanning, including a fixed top progress panel and animated progress bar

Not Included:

- User accounts or login
- Real payments
- Real one-click CMS fixes
- User approval/edit flow, mark-done flow, and real verification execution
- WordPress, Shopify, Wix, or Webflow integrations
- Code generation, automated publishing, platform detection, schema generation, and advanced guided workflows
- Full technical SEO audit
- Large-scale crawling
- JavaScript rendering
- Orphan page detection
- Crawl trap analysis
- Backlink analysis
- Competitor analysis
- Agency or enterprise dashboards

## Tech Stack

Frontend: Next.js
Backend: Next.js API routes
Database: Supabase PostgreSQL via Supabase client directly
Auth: None for MVP
Payments: None for MVP
Hosting: Hostinger VPS using PM2 and Nginx
Analytics: Supabase event tables, GA4, Microsoft Clarity, optional direct Google Ads conversions
AI: OpenAI API for explanations and suggested fixes

## Important Rules

Business Rules:

- Build vertical slices only.
- Every issue should be testable and small enough for MVP work.
- Launch before perfect.
- No feature without validation.
- Show enough report value for free before asking for email.
- Ask for email only after the user clicks "Fix these issues for me".
- Pricing is a fake-door test only; do not collect payment in MVP.
- If a user clicks a pricing plan, show a launch-soon confirmation.
- Use one neutral/global landing page; only pricing changes by market.

Technical Rules:

- Rules detect SEO issues.
- AI explains why issues matter and suggests fixes.
- Do not use AI as the primary detector.
- Crawl up to 5 pages only for MVP.
- Use Supabase client directly, not Prisma, unless this decision changes.
- Store validation data for scans, CTA clicks, emails, pricing views, and pricing clicks.
- Do not add accounts, admin dashboards, or complex admin systems in MVP.
- Report/frontend UX improvements should follow `workflows/report_frontend_ux.md` when that work is requested.
- Search input should accept plain domains like `example.com` and normalize them server-side.
- Prevent duplicate scans while one scan is already submitting.
- Production VPS should use Node.js 22+ because the current Supabase client stack failed on Node 20 without native WebSocket support.

AI Coding Rules:

- Read this file before coding.
- Read `docs/MVP_PRD.md` before coding.
- Read `docs/build_rules.md` before coding.
- Work on one issue/task at a time.
- Do not change unrelated files.
- Ask before making major architecture changes.
- Do not over-engineer MVP.

## Current Architecture Summary

FixMySEO is a Next.js web app. A user enters a website or plain domain, the backend normalizes the URL, crawls up to 5 SMB-important pages using homepage links plus sitemap.xml discovery, extracts reusable SEO page facts, classifies page importance, detects rule-based SEO issues, enriches issues with AI explanations, calculates priority/business fields, and shows a free report focused on top traffic blockers. After `scan_issues` are saved, the MVP Resolution Engine creates up to 5 `seo_resolutions` records for the highest-priority supported issues, stores generated outputs, and creates pending verification expectations. The inline report shows issues and top fixes; `/reports/[scanId]` shows a premium business SEO report with diagnosis, health score, top fix, executive summary, action-plan cards, issue breakdown, and page importance. While scanning, the UI shows a progress panel and prevents duplicate submissions. When the report is ready, the page auto-scrolls to the report. If the user clicks the fix CTA, the app collects email, shows a market-toggle pricing page, records the selected plan click, and displays a launch-soon message.

## Key Files and Folders

- `docs/IDEA.md`: Product idea and first user.
- `docs/MVP_PRD.md`: Main product requirements and MVP scope.
- `docs/VALIDATION.md`: Validation experiment, funnel, and success threshold.
- `docs/ADS.md`: Google Ads launch plan and keywords.
- `docs/LAUNCH_CHECKLIST.md`: Checklist before launch.
- `docs/IMPLEMENTATION_ISSUES.md`: Local draft implementation issues.
- `docs/build_rules.md`: Build constraints for MVP work.
- `docs/SUPABASE_SCHEMA.sql`: Supabase schema for scans, pages, issues, leads, pricing clicks, and events.
- `app/`: Next.js app routes and pages.
- `app/reports/[scanId]/page.tsx`: Premium SEO report page.
- `components/`: UI components for scan form, report, top fixes, email capture, and pricing flow.
- `lib/`: crawler, SEO rules, AI suggestions, pricing config, Supabase helpers, and URL/email utilities.
- `resolution/`: MVP Issue Resolution Engine with types, priority scoring, deterministic rules, planning, AI output generation, repository writes, and verification expectations.
- `components/resolution-fixes.tsx`: Top fixes/action-plan UI fed by resolution API data.
- `lib/page-facts.ts`: Extracts title, meta description, canonical URL, robots meta, H1 count, image alt counts, and word count.
- `lib/page-importance.ts`: Classifies pages as homepage, service, product, pricing, contact, about, blog, legal, or unknown and scores SMB business importance.
- `lib/issue-prioritization.ts`: Adds page importance, business impact, fix difficulty, confidence, estimated impact, exact fix instructions, and priority score to every issue.
- `.agents/skills/`: Local agent skills used for planning and workflow.

## Important Decisions

- Product name: FixMySEO.
- First user: small business owners with simple websites.
- MVP scans up to 5 pages, not only the homepage.
- First SEO checks: page title, meta description, heading structure, image alt text, broken internal links, indexing blocks, and thin content.
- Phase 1 report-quality checks added: canonical tags, duplicate page titles, and duplicate meta descriptions.
- Reports now lead with "Top issues blocking traffic" instead of raw issue count.
- Dedicated report page should feel like a premium SMB business SEO report, not a developer dashboard.
- First 2-3 report scrolls are the most important: lead with diagnosis, business meaning, and what to fix first before raw charts.
- Every prioritized issue should include severity, page importance, business impact, fix difficulty, confidence, estimated impact, exact fix instructions, and priority score.
- Detection is rule-based; AI is only for explanation and suggestions.
- Resolution Engine decisions are deterministic; AI only generates output text/replacements after rules choose the resolution type.
- MVP resolution types currently supported: missing title, missing meta description, missing H1, thin content, noindex, and broken internal links.
- AI resolution generation is currently limited to missing title, missing meta description, and missing H1.
- Resolution UI currently displays top fixes and generated output, but mark-done, edit/regenerate, and real verification remain out of scope/pending.
- `seo_issues` is only an architecture/conversation name. The real persisted issue table is `scan_issues`.
- No accounts in MVP.
- No payments in MVP.
- Fake-door pricing tests intent after email capture.
- Pricing supports India and US using a toggle.
- Google Ads is the only planned launch channel for the first MVP test.
- MVP success threshold: 20 scans, 5 emails, and 2 pricing plan clicks.
- India keyword chart data shifted landing/ad priority toward `seo checker`, `improve seo`, `website optimization`, `seo audit`, and `seo optimization`.
- Lower-priority or spikier chart terms include `seo site checkup`, `website audit tool`, `technical seo audit`, `website seo optimization`, and `seo optimization checker`.
- Landing-page H1: "Find SEO Issues and Improve Your Website Rankings".
- Landing-page subheadline: "Scan your website, identify SEO problems, and get actionable fixes for titles, meta descriptions, content, technical SEO, and on-page optimization."
- GitHub remote: `https://github.com/pranavmangla83-stack/seo-project.git`.
- Initial GitHub push commit: `fcecfb8 Build FixMySEO MVP`.
- Current deployment uses the existing domain `https://customaichatbot.online/` via Nginx proxy to the Next.js app on PM2 port `3001`.
- A FixMySEO SVG logo is served from `/logo.svg` and referenced in Next metadata/icons.

## Analytics Events

Track:

- `scan_started`
- `scan_completed`
- `scan_failed`
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
- `fix_cta_clicked`

Each event should include useful context when available: website URL, scan ID, market shown, plan clicked, price shown, and timestamp.

GA4 automatic events like `page_view`, `session_start`, `first_visit`, and `form_start` may also appear. Use `lead_captured` as the main ad conversion when enough data exists; avoid using `scan_failed` or ordinary `page_view` as primary conversions.

## Verified Integrations

- Supabase schema has been applied via `SUPABASE_DATABASE_URL`, including the resolution tables.
- Supabase writes were tested for scans, pages, issues, leads, pricing clicks, and events.
- Resolution table writes were tested with a local fixture scan: 5 `seo_resolutions`, 15 `seo_resolution_outputs`, and 5 pending `seo_resolution_verifications` were created.
- OpenAI AI suggestion enrichment was tested successfully.
- OpenAI resolution output generation was tested successfully for missing title and missing meta description; missing H1 generation path is implemented and type-checked.
- `/api/scans/[scanId]/resolutions` was added and tested locally for the fixture scan.
- `/reports/[scanId]` was added and tested locally for the fixture scan.
- `.env.local` contains local secrets and must remain ignored.
- GA4 receives events from production, including `scan_started` and automatic GA4 events.
- Microsoft Clarity is wired through `NEXT_PUBLIC_CLARITY_PROJECT_ID`.
- Production scan failures were diagnosed to an invalid Supabase API key on the VPS; the app requires `NEXT_PUBLIC_SUPABASE_URL` plus the matching Supabase `service_role` secret.
- Local TypeScript validation passed with `.\node_modules\.bin\tsc --noEmit`.
- Direct ESLint validation passed on changed scanner/report TypeScript files.
- `npm run lint` and `npm run build` previously failed locally with `ENOSPC: no space left on device`; clear disk space before relying on npm scripts.

## Pending Deployment Requirement

Before deploying code that depends on the new local changes, make sure production has the latest `docs/SUPABASE_SCHEMA.sql` applied. The shared Supabase database was updated during development, but the VPS app still needs the code deployed. Important tables/columns include `scan_pages.importance_score`, `scan_pages.page_type`, `scan_pages.discovery_source`, `scan_pages.canonical_url`, `scan_issues.page_importance`, `scan_issues.business_impact`, `scan_issues.fix_difficulty`, `scan_issues.priority_score`, `seo_resolutions`, `seo_resolution_outputs`, `seo_resolution_verifications`, and `seo_resolution_events`.

## Before Starting Any Coding Session

Read in this order:

1. `docs/AI_CONTEXT.md`
2. `docs/MVP_PRD.md`
3. `docs/build_rules.md`
4. `docs/VALIDATION.md`
5. `docs/HANDOFF.md`
6. Current task or implementation issue

## Notes for Future AI Agents

This project is in MVP validation mode. Prefer the simplest working version that can collect real user intent. Do not build final-product automation, CMS integrations, accounts, admin dashboards, or real payment flows until validation proves demand.

Never expose `.env.local` values. Supabase database/service credentials were visible in local IDE context during deployment; rotate leaked credentials if there is any doubt about exposure.

Higgsfield skills and CLI auth are available locally, but do not use Higgsfield unless the user explicitly asks. At last check the Higgsfield account had 0 credits, so avoid generation jobs unless credits are available and the user confirms the use.
