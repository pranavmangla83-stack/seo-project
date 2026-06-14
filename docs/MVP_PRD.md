# MVP PRD

Working product name: FixMySEO

## Product

An SEO tool that checks a small business website and helps the owner fix important SEO issues with minimal effort.

## First User

Small business owners with simple websites.

## Problem

Small business owners want more traffic from Google, but SEO is expensive, technical, and time-consuming.

## MVP Goal

Help a small business owner enter their website URL, see the most important SEO issues in plain language, and take a simple next action toward fixing them.

## First User Flow

1. User lands on a simple scan page.
2. User enters their website URL.
3. User clicks "Scan my website".
4. Product crawls up to 5 pages.
5. Product shows an SEO report with the top issues.
6. Each issue includes a plain-language explanation and suggested fix.
7. User clicks "Fix these issues for me".
8. Product asks for email.
9. After email submission, product shows pricing.
10. If user clicks a plan, product shows a launch-soon confirmation.

## Accounts

The MVP should not require user accounts or login.

Users should be able to:

- Enter a website URL
- See the report
- Submit email after clicking the fix call to action
- View pricing
- Click a plan

Accounts, saved scans, dashboards, password reset, and team features are not needed for the MVP.

## Validation Data Storage

Use Supabase to store MVP validation data.

Store:

- Website URL
- Pages scanned
- Top issues found
- Email submitted
- Pricing plan clicked
- CTA click timestamp
- Email submission timestamp
- Pricing click timestamp
- Scan creation timestamp

Do not add a CRM, admin dashboard, or account system for MVP unless needed after validation.

## Tech Stack

Use:

- Next.js for the web app
- Supabase for PostgreSQL database storage
- Supabase client directly for database access
- OpenAI API for AI explanations and suggested fixes
- Backend API routes for crawling, SEO checks, email capture, and pricing-click tracking

## First Screen

The first screen should be a simple scan page.

Use one neutral/global landing page for the MVP.

Do not create separate India and US landing pages yet.

Only the pricing page should change by market using the India | US toggle.

Recommended copy:

```text
Find what is hurting your website SEO
```

Primary input:

```text
Website URL
```

Primary button:

```text
Scan my website
```

Supporting line:

```text
Checks your top pages for SEO issues in minutes.
```

## Report Screen

The report screen should show:

- Website scanned
- Pages checked
- Top SEO issues
- Issue severity
- Why each issue matters
- Suggested fix
- "Fix these issues for me" call to action

## Report Access

Show enough of the report for free to create trust.

Free report should include:

- Pages scanned
- Top issues
- Severity
- Short explanation
- Suggested fix preview

Only ask for email after the user clicks "Fix these issues for me".

Do not lock the whole report behind email in the MVP.

## MVP Scan Scope

The MVP should crawl up to 5 pages:

- Homepage
- 2-3 important internal pages
- 1-2 blog or article pages if they exist

The scan should show the top SEO issues across those pages, not every minor issue.

## Page Selection Rules

The crawler should choose pages like this:

1. Always scan the homepage.
2. Find internal links from the homepage.
3. Prefer important pages:
   - `/services`
   - `/service/*`
   - `/about`
   - `/contact`
   - `/pricing`
   - `/products`
   - `/blog`
   - Recent blog posts
4. Stop at 5 pages total.

If the MVP gets real user interest, improving crawl quality is a good next upgrade. That can include scanning more pages, using the sitemap, finding recent blog posts more accurately, and ranking pages by business importance.

## MVP SEO Checks

The first version should check only these issue types:

1. Missing or weak page title
2. Missing or weak meta description
3. Bad heading structure
4. Images missing alt text
5. Broken internal links
6. Pages blocked from Google indexing
7. Thin content on important pages

## Detection Approach

Rules detect what is wrong.

AI explains why it matters and suggests fixes.

The MVP should not rely on AI as the main SEO issue detector. Detection should use deterministic checks so results are consistent, cheaper, faster, and easier to debug.

AI should be used after detection to:

- Explain each issue in simple language
- Suggest improved page titles
- Suggest improved meta descriptions
- Suggest better headings when useful
- Make the report feel helpful for non-coders

## MVP Positioning

The first MVP will not automatically fix website issues.

It will:

- Scan the user's website
- Show the actual SEO issues in plain language
- Explain why each issue matters
- Offer a clear "fix this for me" or "one-click fix" call to action

If users click the fix call to action, that is a validation signal that they want the full product.

## Validation Signal

A user clicking the fix call to action means they are interested in paying for or using an automated solution.

This signal should guide whether to build the real one-click fixing system next.

## Post-CTA Flow

When the user clicks the fix call to action:

1. Ask for their email.
2. After email submission, show a pricing page.
3. Track which plan or buy button the user clicks.
4. After a pricing click, show a launch-soon confirmation page.

The MVP should not claim that automatic fixes are already complete unless the product can actually deliver them.

The MVP will not collect payment.

After a pricing click, tell the user the selected plan is not available yet and that they will be emailed when the product launches.

## Fake-Door Pricing

The MVP should test pricing intent without collecting payment.

Pricing can vary by market:

### India Pricing Test

- Starter: Rs 499
- Growth: Rs 1,499
- Done For You: Rs 4,999

### US Pricing Test

- Starter: $9
- Growth: $29
- Done For You: $99

The pricing page should support showing India pricing or US pricing depending on the selected test market.

If the launch market is not decided, keep both pricing sets documented and make the app flexible enough to switch pricing later.

The pricing page should ask the user to choose market with a simple toggle:

```text
India | US
```

Default can be India for early testing, but the user should be able to switch.

After a user clicks a plan, save:

- Market shown
- Plan clicked
- Price shown
- Website URL
- Email

## Launch-Soon Confirmation

After a user clicks a pricing plan, show:

```text
You're on the list.

This plan is not available yet, but we saved your interest. We'll email you when one-click SEO fixes are ready for your website.
```

Also show:

- Selected plan
- Price shown
- Website URL

## Non-Goals For MVP

- Enterprise SEO workflows
- Advanced team permissions
- Full SEO agency dashboards
- Deep technical audits for experts
- Large-scale crawl infrastructure
- Real one-click CMS fixes
