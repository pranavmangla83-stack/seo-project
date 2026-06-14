# Implementation Issues

These are local draft issues for the FixMySEO MVP. Each issue should be small, testable, and demoable on its own.

## 1. Scaffold The FixMySEO Web App

Status: Done

Type: AFK

Blocked by: None - can start immediately

User stories covered: A small business owner can open the app and see the first scan screen.

### What to build

Create the initial Next.js app with a neutral/global landing page for FixMySEO. The page should include the core headline, website URL input, and "Scan my website" button. No real scanning is required yet, but the first screen should match the MVP direction.

### Acceptance criteria

- [x] Next.js app runs locally.
- [x] Landing page shows "Find what is hurting your website SEO".
- [x] Website URL input is visible.
- [x] "Scan my website" button is visible.
- [x] Page is usable on desktop and mobile.

## 2. Capture Scan Requests In Supabase

Status: Done

Type: AFK

Blocked by: Issue 1

User stories covered: A small business owner can submit a website URL and the app records that a scan started.

### What to build

Connect the app to Supabase and store submitted website URLs as scan records. Add basic URL validation and a simple loading or pending state after submission.

### Acceptance criteria

- [x] Supabase client is configured with environment variables.
- [x] Submitting a valid URL creates a scan record.
- [x] Invalid URLs show a helpful error.
- [x] `scan_started` event is stored.
- [x] No Supabase secret key is exposed to the browser.

## 3. Crawl Up To Five Important Pages

Status: Done

Type: AFK

Blocked by: Issue 2

User stories covered: A small business owner gets a scan that checks more than only the homepage.

### What to build

Build the backend crawler that fetches the homepage, discovers internal links, prefers important pages, and stops at 5 pages total.

### Acceptance criteria

- [x] Homepage is always included.
- [x] Internal links are discovered from the homepage.
- [x] Important paths are preferred when present.
- [x] Crawl stops at 5 pages total.
- [x] Failed pages are handled without crashing the scan.
- [x] Crawled page URLs are stored with the scan.

## 4. Detect The First SEO Issue Set

Status: Done

Type: AFK

Blocked by: Issue 3

User stories covered: A small business owner can see actual SEO issues found on their website.

### What to build

Add rule-based checks for the seven MVP SEO issue types and store issues by page with severity.

### Acceptance criteria

- [x] Detects missing or weak page title.
- [x] Detects missing or weak meta description.
- [x] Detects bad heading structure.
- [x] Detects images missing alt text.
- [x] Detects broken internal links.
- [x] Detects pages blocked from Google indexing.
- [x] Detects thin content on important pages.
- [x] Stores issues with page, type, severity, and short rule-based message.

## 5. Show The Free SEO Report

Status: Done

Type: AFK

Blocked by: Issue 4

User stories covered: A small business owner can understand the scan result before giving an email.

### What to build

Create the report screen showing the website scanned, pages checked, top issues, severity, short explanations, suggested-fix preview, and the "Fix these issues for me" CTA.

### Acceptance criteria

- [x] Report shows website URL.
- [x] Report shows pages checked.
- [x] Report shows top issues.
- [x] Each issue shows severity.
- [x] Report is visible before email capture.
- [x] "Fix these issues for me" CTA is visible.
- [x] `scan_completed` event is stored.

## 6. Add AI Explanations And Suggested Fixes

Status: Done

Type: AFK

Blocked by: Issue 4

User stories covered: A non-coder can understand why an SEO issue matters and what to change.

### What to build

Use OpenAI to turn detected issues into plain-language explanations and suggested fixes. Rules remain the source of truth for detection.

### Acceptance criteria

- [x] AI receives detected issues, not raw responsibility for detection.
- [x] Issues include plain-language explanations.
- [x] Missing titles and descriptions get suggested replacements where useful.
- [x] AI failures fall back to rule-based explanations.
- [x] No secret API key is exposed to the browser.

## 7. Add Email Capture After Fix CTA

Status: Done

Type: AFK

Blocked by: Issue 5

User stories covered: A user can express interest in fixes after seeing report value.

### What to build

When the user clicks "Fix these issues for me", track the click and show email capture. Store email against the scan and continue to pricing.

### Acceptance criteria

- [x] Fix CTA click stores `fix_cta_clicked`.
- [x] Email form appears after CTA click.
- [x] Valid email submission is stored.
- [x] Email is associated with the scan.
- [x] `email_submitted` event is stored.
- [x] User proceeds to pricing after email submission.

## 8. Build Fake-Door Pricing Flow

Status: Done

Type: AFK

Blocked by: Issue 7

User stories covered: A user can show purchase intent without being charged.

### What to build

Create pricing page with India | US toggle, market-specific prices, plan-click tracking, and launch-soon confirmation.

### Acceptance criteria

- [x] Pricing page shows India | US toggle.
- [x] India prices are Rs 499, Rs 1,499, and Rs 4,999.
- [x] US prices are $9, $29, and $99.
- [x] Selected market is tracked.
- [x] Plan click stores market, plan, price, website URL, and email.
- [x] No payment is collected.
- [x] Launch-soon confirmation is shown after plan click.

## 9. Add Google Ads Measurement Readiness

Status: Done

Type: AFK

Blocked by: Issue 8

User stories covered: The product owner can run Google Ads and measure the validation funnel.

### What to build

Add event tracking coverage for the MVP funnel and make the app ready for Google Ads conversion tracking.

### Acceptance criteria

- [x] Tracks scan started.
- [x] Tracks scan completed.
- [x] Tracks fix CTA clicked.
- [x] Tracks email submitted.
- [x] Tracks pricing viewed.
- [x] Tracks pricing market changed.
- [x] Tracks pricing plan clicked.
- [x] Tracks launch-soon viewed.
- [x] Ad traffic can be distinguished from non-ad traffic when campaign parameters exist.

## 10. Deploy MVP And Run Launch QA

Type: HITL

Blocked by: Issue 9

User stories covered: A real user can visit the deployed MVP from a Google ad.

### What to build

Deploy the app, configure production environment variables, run launch QA, and confirm the full funnel works before ads start.

### Acceptance criteria

- [ ] App is deployed to production.
- [ ] Production Supabase writes work.
- [ ] Production OpenAI calls work or fail gracefully.
- [ ] Valid URL scan works.
- [ ] Invalid URL state works.
- [ ] Mobile layout works.
- [ ] India pricing works.
- [ ] US pricing works.
- [ ] Launch-soon confirmation works.
- [ ] Google Ads should not start until this checklist passes.
