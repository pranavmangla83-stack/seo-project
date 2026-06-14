import * as cheerio from "cheerio";

export type CrawledPage = {
  url: string;
  status: "fetched" | "failed";
  httpStatus?: number;
  html?: string;
  title?: string;
};

type CandidateLink = {
  url: string;
  priority: number;
  order: number;
};

const IMPORTANT_PATHS = [
  /^\/services?\/?$/i,
  /^\/service\//i,
  /^\/about\/?$/i,
  /^\/contact\/?$/i,
  /^\/pricing\/?$/i,
  /^\/products?\/?$/i,
  /^\/blog\/?$/i,
  /^\/blog\//i
];

export async function crawlImportantPages(startUrl: string, limit = 5) {
  const homepage = normalizeCrawlUrl(startUrl);
  const homepageHtml = await fetchHtml(homepage);

  if (!homepageHtml.html) {
    return [
      {
        url: homepage,
        status: "failed",
        httpStatus: homepageHtml.httpStatus
      } satisfies CrawledPage
    ];
  }

  const homepagePage: CrawledPage = {
    url: homepage,
    status: "fetched",
    httpStatus: homepageHtml.httpStatus,
    html: homepageHtml.html,
    title: extractTitle(homepageHtml.html)
  };

  const candidates = extractInternalLinks(homepageHtml.html, homepage)
    .filter((candidate) => candidate.url !== homepage)
    .sort((a, b) => a.priority - b.priority || a.order - b.order);

  const selected = [homepage, ...dedupe(candidates.map((item) => item.url))].slice(
    0,
    limit
  );

  const remainingPages = await Promise.all(
    selected.slice(1).map(async (url) => {
      const result = await fetchHtml(url);

      return {
        url,
        status: result.html ? "fetched" : "failed",
        httpStatus: result.httpStatus,
        html: result.html ?? undefined,
        title: result.html ? extractTitle(result.html) : undefined
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
        priority: getPathPriority(parsed.pathname),
        order
      });
    } catch {
      // Ignore malformed links found on user websites.
    }
  });

  return links;
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

function extractTitle(html: string) {
  const $ = cheerio.load(html);
  return $("title").first().text().trim() || undefined;
}

function getPathPriority(pathname: string) {
  const normalizedPath = pathname.toLowerCase();
  const importantIndex = IMPORTANT_PATHS.findIndex((pattern) =>
    pattern.test(normalizedPath)
  );

  if (importantIndex >= 0) {
    return importantIndex;
  }

  return 100;
}

function normalizeCrawlUrl(input: string) {
  const url = new URL(input);
  url.hash = "";

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }

  return url.toString();
}

function dedupe(urls: string[]) {
  return Array.from(new Set(urls));
}
