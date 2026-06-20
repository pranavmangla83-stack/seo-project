import * as cheerio from "cheerio";
import {
  classifyPageImportance,
  getDiscoveryPriority,
  type DiscoverySource,
  type PageType
} from "@/lib/page-importance";
import { extractSeoPageFacts } from "@/lib/page-facts";

export type CrawledPage = {
  url: string;
  status: "fetched" | "failed";
  discoverySource: DiscoverySource;
  httpStatus?: number;
  html?: string;
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  wordCount?: number;
  pageType?: PageType;
  importanceScore?: number;
  importanceReason?: string;
};

type CandidateLink = {
  url: string;
  source: DiscoverySource;
  priority: number;
  order: number;
};

export async function crawlImportantPages(startUrl: string, limit = 5) {
  const homepage = normalizeCrawlUrl(startUrl);
  const homepageHtml = await fetchHtml(homepage);

  if (!homepageHtml.html) {
    return [
      {
        url: homepage,
        status: "failed",
        discoverySource: "manual_start_url",
        httpStatus: homepageHtml.httpStatus
      } satisfies CrawledPage
    ];
  }

  const homepageFacts = extractSeoPageFacts(homepageHtml.html, homepage);
  const homepageImportance = classifyPageImportance(
    homepage,
    "manual_start_url",
    homepageFacts
  );

  const homepagePage: CrawledPage = {
    url: homepage,
    status: "fetched",
    discoverySource: "manual_start_url",
    httpStatus: homepageHtml.httpStatus,
    html: homepageHtml.html,
    title: homepageFacts.title || undefined,
    metaDescription: homepageFacts.metaDescription || undefined,
    canonicalUrl: homepageFacts.canonicalUrl || undefined,
    wordCount: homepageFacts.wordCount,
    pageType: homepageImportance.pageType,
    importanceScore: homepageImportance.importanceScore,
    importanceReason: homepageImportance.importanceReason
  };

  const sitemapCandidates = await discoverSitemapUrls(homepage);
  const candidates = [
    ...extractInternalLinks(homepageHtml.html, homepage),
    ...sitemapCandidates
  ]
    .filter((candidate) => candidate.url !== homepage)
    .sort((a, b) => a.priority - b.priority || a.order - b.order);

  const selected = [
    { url: homepage, source: "manual_start_url" as const },
    ...dedupeCandidates(candidates)
  ].slice(0, limit);

  const remainingPages = await Promise.all(
    selected.slice(1).map(async (candidate) => {
      const result = await fetchHtml(candidate.url);

      if (!result.html) {
        return {
          url: candidate.url,
          status: "failed",
          discoverySource: candidate.source,
          httpStatus: result.httpStatus
        } satisfies CrawledPage;
      }

      const facts = extractSeoPageFacts(result.html, candidate.url);
      const importance = classifyPageImportance(
        candidate.url,
        candidate.source,
        facts
      );

      return {
        url: candidate.url,
        status: "fetched",
        discoverySource: candidate.source,
        httpStatus: result.httpStatus,
        html: result.html,
        title: facts.title || undefined,
        metaDescription: facts.metaDescription || undefined,
        canonicalUrl: facts.canonicalUrl || undefined,
        wordCount: facts.wordCount,
        pageType: importance.pageType,
        importanceScore: importance.importanceScore,
        importanceReason: importance.importanceReason
      } satisfies CrawledPage;
    })
  );

  return [homepagePage, ...remainingPages];
}

function extractInternalLinks(html: string, baseUrl: string) {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const links: CandidateLink[] = [];

  $("a[href]").each((order, element) => {
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    try {
      const url = normalizeCrawlUrl(new URL(href, base).toString());
      const parsed = new URL(url);

      if (parsed.hostname !== base.hostname) {
        return;
      }

      links.push({
        url,
        source: "homepage_link",
        priority: getDiscoveryPriority(url, "homepage_link"),
        order
      });
    } catch {
      // Ignore malformed links found on user websites.
    }
  });

  return links;
}

async function discoverSitemapUrls(homepage: string) {
  const sitemapUrl = new URL("/sitemap.xml", homepage).toString();

  try {
    const sitemapText = await fetchSitemapText(sitemapUrl);

    if (!sitemapText) {
      return [];
    }

    const directUrls = parseSitemapPageUrls(sitemapText, homepage, 1000);

    if (directUrls.length > 0) {
      return directUrls;
    }

    const nestedSitemapUrls = parseNestedSitemapUrls(sitemapText, homepage).slice(
      0,
      3
    );
    const nestedResults = await Promise.all(
      nestedSitemapUrls.map(async (url, index) => {
        const nestedText = await fetchSitemapText(url);
        return nestedText
          ? parseSitemapPageUrls(nestedText, homepage, 1500 + index * 500)
          : [];
      })
    );

    return nestedResults.flat();
  } catch {
    return [];
  }
}

async function fetchSitemapText(sitemapUrl: string) {
  const response = await fetch(sitemapUrl, {
    headers: {
      "User-Agent": "FixMySEO/0.1 (+https://fixmyseo.local)"
    },
    signal: AbortSignal.timeout(5000)
  });

  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok || !isSitemapContentType(contentType)) {
    return null;
  }

  return response.text();
}

function parseSitemapPageUrls(
  sitemapText: string,
  homepage: string,
  orderBase: number
) {
  const $ = cheerio.load(sitemapText, { xmlMode: true });
  const base = new URL(homepage);
  const urls: CandidateLink[] = [];

  $("url > loc").each((order, element) => {
    const loc = $(element).text().trim();

    try {
      const url = normalizeCrawlUrl(loc);
      const parsed = new URL(url);

      if (parsed.hostname !== base.hostname) {
        return;
      }

      urls.push({
        url,
        source: "sitemap",
        priority: getDiscoveryPriority(url, "sitemap"),
        order: order + orderBase
      });
    } catch {
      // Ignore malformed sitemap entries.
    }
  });

  return urls;
}

function parseNestedSitemapUrls(sitemapText: string, homepage: string) {
  const $ = cheerio.load(sitemapText, { xmlMode: true });
  const base = new URL(homepage);
  const urls: string[] = [];

  $("sitemap > loc").each((_, element) => {
    const loc = $(element).text().trim();

    try {
      const url = normalizeCrawlUrl(loc);
      const parsed = new URL(url);

      if (parsed.hostname !== base.hostname) {
        return;
      }

      urls.push(url);
    } catch {
      // Ignore malformed sitemap entries.
    }
  });

  return urls;
}

async function fetchHtml(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FixMySEO/0.1 (+https://fixmyseo.local)"
      },
      signal: AbortSignal.timeout(10000)
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok || !contentType.includes("text/html")) {
      return {
        httpStatus: response.status,
        html: null
      };
    }

    return {
      httpStatus: response.status,
      html: await response.text()
    };
  } catch {
    return {
      httpStatus: undefined,
      html: null
    };
  }
}

function normalizeCrawlUrl(input: string) {
  const url = new URL(input);
  url.hash = "";

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

function isSitemapContentType(contentType: string) {
  return (
    contentType.includes("xml") ||
    contentType.includes("text/plain") ||
    contentType === ""
  );
}

function dedupeCandidates(candidates: CandidateLink[]) {
  const seen = new Set<string>();
  const unique: Array<{ url: string; source: DiscoverySource }> = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.url)) {
      continue;
    }

    seen.add(candidate.url);
    unique.push({
      url: candidate.url,
      source: candidate.source
    });
  }

  return unique;
}
