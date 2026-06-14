import { NextResponse } from "next/server";
import { addAiSuggestions } from "@/lib/ai-suggestions";
import { crawlImportantPages } from "@/lib/crawler";
import { detectSeoIssues } from "@/lib/seo-checks";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { normalizeWebsiteUrl } from "@/lib/url";

export async function POST(request: Request) {
  let websiteUrl: string;
  let normalizedUrl: string;
  let requestCampaign: unknown = {};

  try {
    const body = (await request.json()) as {
      websiteUrl?: unknown;
      campaign?: unknown;
    };
    websiteUrl = typeof body.websiteUrl === "string" ? body.websiteUrl : "";
    normalizedUrl = normalizeWebsiteUrl(websiteUrl);
    requestCampaign = body.campaign;
  } catch {
    return NextResponse.json(
      { error: "Enter a valid website URL." },
      { status: 400 }
    );
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured yet. Add the environment variables from .env.example."
      },
      { status: 503 }
    );
  }

  const supabase = createSupabaseServerClient();

  const { data: scan, error: scanError } = await supabase
    .from("scans")
    .insert({
      website_url: websiteUrl.trim(),
      normalized_url: normalizedUrl,
      status: "started"
    })
    .select("id, website_url, normalized_url, status, created_at")
    .single();

  if (scanError) {
    return NextResponse.json(
      { error: "Could not start scan. Please try again." },
      { status: 500 }
    );
  }

  await supabase.from("events").insert({
    event_name: "scan_started",
    scan_id: scan.id,
    website_url: normalizedUrl,
    metadata: {
      source: "landing_page",
      campaign: sanitizeCampaign(requestCampaign)
    }
  });

  const pages = await crawlImportantPages(normalizedUrl, 5);

  if (pages.length > 0) {
    await supabase.from("scan_pages").insert(
      pages.map((page) => ({
        scan_id: scan.id,
        url: page.url,
        status: page.status,
        http_status: page.httpStatus ?? null,
        title: page.title ?? null
      }))
    );
  }

  const detectedIssues = await detectSeoIssues(pages);
  const issues = await addAiSuggestions(detectedIssues);

  if (issues.length > 0) {
    await supabase.from("scan_issues").insert(
      issues.map((issue) => ({
        scan_id: scan.id,
        page_url: issue.pageUrl,
        issue_type: issue.issueType,
        severity: issue.severity,
        message: issue.message,
        details: {
          ...(issue.details ?? {}),
          explanation: issue.explanation ?? null,
          suggestedFix: issue.suggestedFix ?? null
        }
      }))
    );
  }

  await supabase
    .from("scans")
    .update({
      status: "completed"
    })
    .eq("id", scan.id);

  await supabase.from("events").insert({
    event_name: "scan_completed",
    scan_id: scan.id,
    website_url: normalizedUrl,
    metadata: {
      pages_checked: pages.length,
      issues_found: issues.length
    }
  });

  return NextResponse.json({
    scan: {
      ...scan,
      status: "completed"
    },
    pages,
    issues
  });
}

function sanitizeCampaign(campaign: unknown) {
  if (!campaign || typeof campaign !== "object") {
    return {};
  }

  const allowedKeys = new Set([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid"
  ]);

  return Object.fromEntries(
    Object.entries(campaign)
      .filter(([key, value]) => allowedKeys.has(key) && typeof value === "string")
      .map(([key, value]) => [key, value.slice(0, 200)])
  );
}
