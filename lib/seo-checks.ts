import * as cheerio from "cheerio";
import type { CrawledPage } from "@/lib/crawler";
import { extractSeoPageFacts } from "@/lib/page-facts";

export type SeoIssue = {
  pageUrl: string;
  issueType:
    | "weak_page_title"
    | "weak_meta_description"
    | "bad_heading_structure"
    | "missing_image_alt"
    | "broken_internal_link"
    | "blocked_from_indexing"
    | "thin_content"
    | "missing_canonical"
    | "canonical_points_elsewhere"
    | "duplicate_page_title"
    | "duplicate_meta_description";
  severity: "high" | "medium" | "low";
  message: string;
  explanation?: string;
  suggestedFix?: string;
  priority?: number;
  pageImportance?: number;
  businessImpact?: string;
  fixDifficulty?: "easy" | "medium" | "hard";
  confidence?: "high" | "medium" | "low";
  estimatedImpact?: "high" | "medium" | "low";
  exactFix?: string;
  priorityScore?: number;
  sortScore?: number;
  details?: Record<string, unknown>;
};

export async function detectSeoIssues(pages: CrawledPage[]) {
  const issues: SeoIssue[] = [];
  const fetchedPages = pages.filter((page) => page.status === "fetched" && page.html);

  for (const page of fetchedPages) {
    issues.push(...detectPageIssues(page));
  }

  issues.push(...detectDuplicateMetadata(fetchedPages));
  const brokenLinks = await detectBrokenInternalLinks(fetchedPages);
  issues.push(...brokenLinks);

  return issues;
}

function detectPageIssues(page: CrawledPage) {
  const html = page.html ?? "";
  const facts = extractSeoPageFacts(html, page.url);
  const issues: SeoIssue[] = [];

  if (!facts.title || facts.title.length < 20 || facts.title.length > 65) {
    issues.push({
      pageUrl: page.url,
      issueType: "weak_page_title",
      severity: !facts.title ? "high" : "medium",
      message: !facts.title
        ? "This page is missing a page title."
        : "This page title may be too short or too long.",
      details: {
        title: facts.title,
        length: facts.title.length,
        recommendedLength: "20-65 characters"
      }
    });
  }

  if (
    !facts.metaDescription ||
    facts.metaDescription.length < 70 ||
    facts.metaDescription.length > 160
  ) {
    issues.push({
      pageUrl: page.url,
      issueType: "weak_meta_description",
      severity: !facts.metaDescription ? "medium" : "low",
      message: !facts.metaDescription
        ? "This page is missing a meta description."
        : "This meta description may be too short or too long.",
      details: {
        metaDescription: facts.metaDescription,
        length: facts.metaDescription.length,
        recommendedLength: "70-160 characters"
      }
    });
  }

  if (facts.h1Count !== 1) {
    issues.push({
      pageUrl: page.url,
      issueType: "bad_heading_structure",
      severity: facts.h1Count === 0 ? "medium" : "low",
      message:
        facts.h1Count === 0
          ? "This page does not have an H1 heading."
          : "This page has more than one H1 heading.",
      details: {
        h1Count: facts.h1Count
      }
    });
  }

  if (facts.missingAltCount > 0) {
    issues.push({
      pageUrl: page.url,
      issueType: "missing_image_alt",
      severity: facts.missingAltCount > 5 ? "medium" : "low",
      message: "Some images on this page are missing alt text.",
      details: {
        totalImages: facts.totalImages,
        missingAltCount: facts.missingAltCount
      }
    });
  }

  if (facts.robotsMeta.includes("noindex")) {
    issues.push({
      pageUrl: page.url,
      issueType: "blocked_from_indexing",
      severity: "high",
      message: "This page has a noindex tag, so Google may not show it in search.",
      details: {
        robotsMeta: facts.robotsMeta
      }
    });
  }

  if (facts.wordCount < 250) {
    issues.push({
      pageUrl: page.url,
      issueType: "thin_content",
      severity: facts.wordCount < 100 ? "medium" : "low",
      message: "This page may not have enough written content for search engines.",
      details: {
        wordCount: facts.wordCount,
        recommendedMinimum: 250
      }
    });
  }

  if (!facts.canonicalUrl) {
    issues.push({
      pageUrl: page.url,
      issueType: "missing_canonical",
      severity: "low",
      message: "This page does not declare a canonical URL.",
      details: {
        canonicalUrl: ""
      }
    });
  } else if (normalizeForComparison(facts.canonicalUrl) !== normalizeForComparison(page.url)) {
    issues.push({
      pageUrl: page.url,
      issueType: "canonical_points_elsewhere",
      severity: "medium",
      message: "This page points search engines to a different canonical URL.",
      details: {
        canonicalUrl: facts.canonicalUrl,
        pageUrl: page.url
      }
    });
  }

  return issues;
}

function detectDuplicateMetadata(pages: CrawledPage[]) {
  const issues: SeoIssue[] = [];
  const titleGroups = groupByNormalizedValue(pages, (page) => page.title ?? "");
  const metaGroups = groupByNormalizedValue(
    pages,
    (page) => page.metaDescription ?? ""
  );

  for (const group of titleGroups) {
    issues.push({
      pageUrl: getMostImportantPage(group).url,
      issueType: "duplicate_page_title",
      severity: "medium",
      message: "Multiple scanned pages use the same page title.",
      details: {
        duplicateTitle: group[0].title,
        affectedPages: group.map((page) => page.url)
      }
    });
  }

  for (const group of metaGroups) {
    issues.push({
      pageUrl: getMostImportantPage(group).url,
      issueType: "duplicate_meta_description",
      severity: "low",
      message: "Multiple scanned pages use the same meta description.",
      details: {
        duplicateMetaDescription: group[0].metaDescription,
        affectedPages: group.map((page) => page.url)
      }
    });
  }

  return issues;
}

async function detectBrokenInternalLinks(pages: CrawledPage[]) {
  const issues: SeoIssue[] = [];

  for (const page of pages) {
    const $ = cheerio.load(page.html ?? "");
    const base = new URL(page.url);
    const internalLinks = dedupe(
      $("a[href]")
        .toArray()
        .map((element) => $(element).attr("href"))
        .filter((href): href is string => Boolean(href))
        .map((href) => {
          try {
            const url = new URL(href, base);
            url.hash = "";
            return url.hostname === base.hostname ? url.toString() : null;
          } catch {
            return null;
          }
        })
        .filter((url): url is string => Boolean(url))
    ).slice(0, 10);

    const brokenLinks: string[] = [];

    await Promise.all(
      internalLinks.map(async (url) => {
        const status = await getLinkStatus(url);

        if (status >= 400) {
          brokenLinks.push(url);
        }
      })
    );

    if (brokenLinks.length > 0) {
      issues.push({
        pageUrl: page.url,
        issueType: "broken_internal_link",
        severity: brokenLinks.length > 2 ? "medium" : "low",
        message: "This page links to internal pages that may be broken.",
        details: {
          brokenLinks
        }
      });
    }
  }

  return issues;
}

async function getLinkStatus(url: string) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(2500)
    });

    return response.status;
  } catch {
    try {
      const response = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(2500)
      });

      return response.status;
    } catch {
      return 0;
    }
  }
}

function dedupe(urls: string[]) {
  return Array.from(new Set(urls));
}

function groupByNormalizedValue(
  pages: CrawledPage[],
  getValue: (page: CrawledPage) => string
) {
  const groups = new Map<string, CrawledPage[]>();

  for (const page of pages) {
    const value = getValue(page).replace(/\s+/g, " ").trim().toLowerCase();

    if (!value) {
      continue;
    }

    groups.set(value, [...(groups.get(value) ?? []), page]);
  }

  return Array.from(groups.values()).filter((group) => group.length > 1);
}

function getMostImportantPage(pages: CrawledPage[]) {
  return [...pages].sort(
    (a, b) => (b.importanceScore ?? 0) - (a.importanceScore ?? 0)
  )[0];
}

function normalizeForComparison(input: string) {
  try {
    const url = new URL(input);
    url.hash = "";

    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString().toLowerCase();
  } catch {
    return input.trim().toLowerCase();
  }
}
