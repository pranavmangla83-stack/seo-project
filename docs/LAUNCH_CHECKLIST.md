# Launch Checklist

## Product Scope

- [ ] Confirm MVP is still limited to scan, report, email capture, fake-door pricing, and launch-soon confirmation.
- [ ] Confirm no accounts, no payments, and no real one-click CMS fixes are being launched.
- [ ] Confirm one neutral/global landing page is used.
- [ ] Confirm pricing page supports India | US toggle.

## App Setup

- [ ] Create Next.js app.
- [ ] Add Supabase client.
- [ ] Add environment variables for Supabase.
- [ ] Add environment variable for OpenAI API.
- [ ] Add basic URL validation.
- [ ] Add production-safe error handling for failed scans.

## Supabase

- [ ] Create Supabase project.
- [ ] Create tables for scans, pages, issues, leads, and events.
- [ ] Store scan URL, pages scanned, top issues, email, selected market, selected plan, and timestamps.
- [ ] Verify no secret keys are exposed to the browser.
- [ ] Test writing scan and event data from local app.

## Scanner

- [ ] Crawl homepage first.
- [ ] Discover internal links from homepage.
- [ ] Prefer `/services`, `/service/*`, `/about`, `/contact`, `/pricing`, `/products`, `/blog`, and recent blog posts.
- [ ] Stop at 5 pages total.
- [ ] Detect missing or weak page title.
- [ ] Detect missing or weak meta description.
- [ ] Detect bad heading structure.
- [ ] Detect images missing alt text.
- [ ] Detect broken internal links.
- [ ] Detect pages blocked from Google indexing.
- [ ] Detect thin content on important pages.

## AI Suggestions

- [ ] Use rule-based detection first.
- [ ] Send detected issues to AI for simple explanations and suggested fixes.
- [ ] Generate suggested titles and meta descriptions where useful.
- [ ] Handle AI failure gracefully by showing rule-based explanations.

## User Flow

- [ ] Landing page shows website URL input and "Scan my website" button.
- [ ] Report page shows pages scanned and top issues.
- [ ] Report is useful before email capture.
- [ ] "Fix these issues for me" CTA is visible after report.
- [ ] CTA opens email capture.
- [ ] Email submission leads to pricing page.
- [ ] Pricing page has India | US toggle.
- [ ] Plan click shows launch-soon confirmation.

## Ads And Tracking

- [ ] Install Google Ads conversion tracking if running ads.
- [ ] Track ad click to scan started.
- [ ] Track scan completed.
- [ ] Track fix CTA clicked.
- [ ] Track email submitted.
- [ ] Track pricing page viewed.
- [ ] Track pricing plan clicked.
- [ ] Use keywords from `docs/ADS.md`.
- [ ] Start with a small test budget.

## Success Threshold

- [ ] 20 website scans.
- [ ] 5 email submissions.
- [ ] 2 pricing plan clicks.

## Pre-Launch QA

- [ ] Test with a valid website URL.
- [ ] Test with an invalid URL.
- [ ] Test with a slow or unreachable website.
- [ ] Test a website with no blog.
- [ ] Test mobile layout.
- [ ] Test India pricing.
- [ ] Test US pricing.
- [ ] Confirm no payment is collected.
- [ ] Confirm launch-soon message is shown after plan click.

## Launch Decision

- [ ] Launch Google Ads only after the full funnel works end to end.
- [ ] Continue to final product only if the MVP hits or approaches the validation threshold.
