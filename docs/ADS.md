# Google Ads Plan

## Launch Channel

Use Google Ads only for the MVP launch.

Manual outreach is not part of the first launch plan.

## Goal

Use Google Ads as a small validation test, not a full growth engine.

The first goal is to get enough traffic to measure:

- Website scans
- Fix CTA clicks
- Email submissions
- Pricing plan clicks

## Recommended Ad Promise

```text
Free SEO checker for your website
```

Supporting promise:

```text
Scan your website, find SEO issues, and get clear fixes to improve SEO.
```

## Keywords To Test First

These keywords are prioritized from the India trend chart data:

- seo checker
- improve seo
- website optimization
- seo audit
- seo optimization

## Secondary Keywords To Test

- check my website seo
- website seo checker
- seo audit tool
- seo optimizer
- seo analyzer
- seo score checker
- seo audit for small business

## Lower Priority Keywords

These had weaker or spikier chart signals, so test them later or with a small budget:

- seo site checkup
- website audit tool
- technical seo audit
- website seo optimization
- seo optimization checker

## Keywords To Avoid At First

Avoid broad, expensive, or low-intent keywords like:

- seo
- digital marketing
- marketing agency
- google ranking

## Measurement Funnel

Track these steps from ad traffic:

1. Ad click
2. Website scan started
3. Website scan completed
4. "Fix these issues for me" clicked
5. Email submitted
6. Pricing page viewed
7. Pricing plan clicked

GA4 custom events currently used for this funnel:

- `scan_started`
- `scan_completed`
- `lead_captured`
- `pricing_viewed`
- `pricing_plan_clicked`
- `pricing_interest_saved`

Use `lead_captured` as the main Google Ads conversion once it has appeared in GA4. Do not use `scan_failed` or ordinary `page_view` as the main conversion.

## Launch Readiness

Before spending meaningful budget, confirm production scans complete reliably with `example.com` and a real business website.

## Budget Rule

Start with a small test budget.

Do not optimize for profit yet. Optimize for learning whether users care enough to scan their website and click a pricing plan.
