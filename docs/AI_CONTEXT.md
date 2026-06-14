# AI Context

## Project Overview

Project Name: FixMySEO
Stage: MVP planning, ready for initial build
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
- AI explanations and suggested fixes
- Free report preview
- "Fix these issues for me" CTA
- Email capture after CTA click
- Fake-door pricing page with India | US toggle
- Launch-soon confirmation after pricing click
- Supabase storage for validation data and funnel events
- Google Ads as the first launch channel

Not Included:

- User accounts or login
- Real payments
- Real one-click CMS fixes
- WordPress, Shopify, Wix, or Webflow integrations
- Full technical SEO audit
- Large-scale crawling
- Backlink analysis
- Competitor analysis
- Agency or enterprise dashboards

## Tech Stack

Frontend: Next.js
Backend: Next.js API routes
Database: Supabase PostgreSQL via Supabase client directly
Auth: None for MVP
Payments: None for MVP
Hosting: Vercel recommended
Analytics: Supabase event tables first; Google Ads tracking for ad traffic
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
- Do not add accounts, dashboards, or complex admin systems in MVP.

AI Coding Rules:

- Read this file before coding.
- Read `docs/MVP_PRD.md` before coding.
- Read `docs/build_rules.md` before coding.
- Work on one issue/task at a time.
- Do not change unrelated files.
- Ask before making major architecture changes.
- Do not over-engineer MVP.

## Current Architecture Summary

FixMySEO should be a Next.js web app. A user enters a website URL, the backend crawls up to 5 important pages, rule-based SEO checks detect issues, AI generates plain-language explanations and suggested fixes, and the report is shown for free. If the user clicks the fix CTA, the app collects email, shows a market-toggle pricing page, records the selected plan click, and displays a launch-soon message.

## Key Files and Folders

- `docs/IDEA.md`: Product idea and first user.
- `docs/MVP_PRD.md`: Main product requirements and MVP scope.
- `docs/VALIDATION.md`: Validation experiment, funnel, and success threshold.
- `docs/ADS.md`: Google Ads launch plan and keywords.
- `docs/LAUNCH_CHECKLIST.md`: Checklist before launch.
- `docs/IMPLEMENTATION_ISSUES.md`: Local draft implementation issues.
- `docs/build_rules.md`: Build constraints for MVP work.
- `.agents/skills/`: Local agent skills used for planning and workflow.

## Important Decisions

- Product name: FixMySEO.
- First user: small business owners with simple websites.
- MVP scans up to 5 pages, not only the homepage.
- First SEO checks: page title, meta description, heading structure, image alt text, broken internal links, indexing blocks, and thin content.
- Detection is rule-based; AI is only for explanation and suggestions.
- No accounts in MVP.
- No payments in MVP.
- Fake-door pricing tests intent after email capture.
- Pricing supports India and US using a toggle.
- Google Ads is the only planned launch channel for the first MVP test.
- MVP success threshold: 20 scans, 5 emails, and 2 pricing plan clicks.

## Analytics Events

Track:

- `scan_started`
- `scan_completed`
- `fix_cta_clicked`
- `email_submitted`
- `pricing_viewed`
- `pricing_market_changed`
- `pricing_plan_clicked`
- `launch_soon_viewed`

Each event should include useful context when available: website URL, scan ID, market shown, plan clicked, price shown, and timestamp.

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
