# Report Frontend UX Workflow

## Objective

Improve only the FixMySEO report/frontend experience so it feels like a premium business SEO report for small business owners.

## Scope

Use this workflow for:

- `/reports/[scanId]`
- inline scan report UI
- top fixes presentation
- report copy, spacing, hierarchy, responsiveness, and perceived trust
- first 2-3 scrolls of the report page

Do not use this workflow for backend architecture, new SEO checks, crawling, payments, accounts, platform detection, code generation, automated publishing, or real verification.

## Required Context

Before making changes, read:

1. `docs/AI_CONTEXT.md`
2. `docs/MVP_PRD.md`
3. `docs/build_rules.md`
4. `docs/HANDOFF.md`
5. Current report files:
   - `app/reports/[scanId]/page.tsx`
   - `components/resolution-fixes.tsx`
   - `components/seo-report.tsx`
   - `app/globals.css`

## UX Standard

The report should feel like a premium consultant-style audit, not a raw developer dashboard.

Prioritize:

- diagnosis before metrics
- business meaning before technical labels
- "what to fix first" before charts
- clear first-scroll narrative
- strong visual hierarchy
- rich but readable top fix cards
- mobile-friendly layout
- SMB-friendly language
- trust, clarity, and momentum toward the fix CTA

Avoid:

- jargon-heavy headings
- empty hero space
- generic cards with thin copy
- charts before user value is clear
- UI that feels like database output
- adding functionality behind disabled buttons unless explicitly requested

## Recommended First 3 Scrolls

1. Main diagnosis:
   - domain
   - scan date
   - SEO health score
   - plain-language verdict
   - what this means for the business

2. Fix-this-first section:
   - highest-priority resolution
   - why it matters
   - effort/difficulty
   - expected value

3. Top fixes action plan:
   - top 5 fixes
   - business impact
   - AI suggested fix
   - before/after framing
   - where to apply it
   - verification status
   - disabled/pending actions clearly shown when backend is not implemented

Move issue breakdown and page-importance charts lower as supporting proof unless the user explicitly asks otherwise.

## Higgsfield Rule

Do not use Higgsfield unless the user explicitly asks for it in the current task.

If the user asks to use Higgsfield for report/frontend visuals:

1. Check account status first.
2. If credits are 0, do not generate.
3. Prefer one reusable 16:9 premium report hero image.
4. Avoid video, 3D, avatars, product photoshoots, marketplace cards, and multiple variants unless the user explicitly approves credit use.

## Verification

After changes, run focused checks when feasible:

```powershell
.\node_modules\.bin\tsc --noEmit --incremental false
.\node_modules\.bin\eslint app/reports/[scanId]/page.tsx components/resolution-fixes.tsx components/seo-report.tsx
npm run build
```

If a local dev server is running, smoke-test a known report route such as:

```text
http://localhost:3000/reports/b97c2037-d79a-461f-8368-9a303b315d64
```

## Output

When done, summarize:

- files changed
- UX improvements made
- whether backend behavior changed
- checks run
- what remains pending
