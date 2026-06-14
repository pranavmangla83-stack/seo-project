import * as cheerio from "cheerio";
import type { CrawledPage } from "@/lib/crawler";

export type SeoIssue = {
  pageUrl: string;
  issueType:
    | "weak_page_title"
    | "weak_meta_description"
    | "bad_heading_structure"
    | "missing_image_alt"
    | "broken_internal_link"
    | "blocked_from_indexing"
    | "thin_content";
  severity: "high" | "medium" | "low";
  message: string;
  explanation?: string;
  suggestedFix?: string;
  details?: Record<string, unknown>;
};

export async function detectSeoIssues(pages: CrawledPage[]) {
  const issues: SeoIssue[] = [];
  const fetchedPages = pages.filter((page) => page.status === "fetched" && page.html);

  for (const page of fetchedPages) {
    issues.push(...detectPageIssues(page));
  }

  const brokenLinks = await detectBrokenInternalLinks(fetchedPages);
  issues.push(...brokenLinks);

  return issues;
}

function detectPageIssues(page: CrawledPage) {
  const html = page.html ?? "";
  const $ = cheerio.load(html);
  const issues: SeoIssue[] = [];
  const title = $("title").first().text().trim();
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1Count = $("h1").length;
  const images = $("img").toArray();
  const imagesMissingAlt = images.filter((image) => {
    const alt = $(image).attr("alt");
    return alt === undefined || alt.trim() === "";
  });
  const robotsMeta = $('meta[name="robots"]').attr("content")?.toLowerCase() ?? "";
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").filter(Boolean).length : 0;

  if (!title || title.length < 20 || title.length > 65) {
    issues.push({
      pageUrl: page.url,
      issueType: "weak_page_title",
      severity: !title ? "high" : "medium",
      message: !title
        ? "This page is missing a page title."
        : "This page title may be too short or too long.",
      details: {
        title,
        length: title.length,
        recommendedLength: "20-65 characters"
      }
    });
  }

  if (!metaDescription || metaDescription.length < 70 || metaDescription.length > 160) {
    issues.push({
      pageUrl: page.url,
      issueType: "weak_meta_description",
      severity: !metaDescription ? "medium" : "low",
      message: !metaDescription
        ? "This page is missing a meta description."
        : "This meta description may be too short or too long.",
      details: {
        metaDescription,
        length: metaDescription.length,
        recommendedLength: "70-160 characters"
      }
    });
  }

  if (h1Count !== 1) {
    issues.push({
      pageUrl: page.url,
      issueType: "bad_heading_structure",
      severity: h1Count === 0 ? "medium" : "low",
      message:
        h1Count === 0
          ? "This page does not have an H1 heading."
          : "This page has more than one H1 heading.",
      details: {
        h1Count
      }
    });
  }

  if (imagesMissingAlt.length > 0) {
    issues.push({
      pageUrl: page.url,
      issueType: "missing_image_alt",
      severity: imagesMissingAlt.length > 5 ? "medium" : "low",
      message: "Some images on this page are missing alt text.",
      details: {
        totalImages: images.length,
        missingAltCount: imagesMissingAlt.length
      }
    });
  }

  if (robotsMeta.includes("noindex")) {
    issues.push({
      pageUrl: page.url,
      issueType: "blocked_from_indexing",
      severity: "high",
      message: "This page has a noindex tag, so Google may not show it in search.",
      details: {
        robotsMeta
      }
    });
  }

  if (wordCount < 250) {
    issues.push({
      pageUrl: page.url,
      issueType: "thin_content",
      severity: wordCount < 100 ? "medium" : "low",
      message: "This page may not have enough written content for search engines.",
      details: {
        wordCount,
        recommendedMinimum: 250
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
