import { NextResponse } from "next/server";
import { addAiSuggestions } from "@/lib/ai-suggestions";
import { crawlImportantPages } from "@/lib/crawler";
import { prioritizeSeoIssues } from "@/lib/issue-prioritization";
import { detectSeoIssues } from "@/lib/seo-checks";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";
import { normalizeWebsiteUrl } from "@/lib/url";
import { planResolutionsForScan } from "@/resolution/planner";

export async function POST(request: Request) {
  let normalizedUrl: string;
  let requestCampaign: unknown = {};
  let body: {
    websiteUrl?: unknown;
    campaign?: unknown;
    debug?: unknown;
  } | null = null;

  try {
    body = (await request.json()) as {
      websiteUrl?: unknown;
      campaign?: unknown;
      debug?: unknown;
    };
  } catch {
    return NextResponse.json(
      { error: "Enter a valid website URL." },
      { status: 400 }
    );
  }

  const websiteUrl = typeof body.websiteUrl === "string" ? body.websiteUrl : "";
  requestCampaign = body.campaign;
  const submitDebug = sanitizeSubmitDebug(body.debug);

  try {
    normalizedUrl = normalizeWebsiteUrl(websiteUrl);
  } catch (error) {
    if (hasSupabaseConfig()) {
      const supabase = createSupabaseServerClient();

      await supabase.from("events").insert({
        event_name: "scan_failed",
        website_url: websiteUrl.trim(),
        metadata: {
          reason: "invalid_url",
          message:
            error instanceof Error
              ? error.message
              : "Enter a valid website URL.",
          input_length: websiteUrl.trim().length,
          has_input: websiteUrl.trim().length > 0,
          submit_debug: submitDebug,
          source: "landing_page",
          campaign: sanitizeCampaign(requestCampaign)
        }
      });
    }

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
      campaign: sanitizeCampaign(requestCampaign),
      submit_debug: submitDebug
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
        title: page.title ?? null,
        normalized_url: page.url,
        page_type: page.pageType ?? null,
        discovery_source: page.discoverySource,
        importance_score: page.importanceScore ?? null,
        importance_reason: page.importanceReason ?? null,
        canonical_url: page.canonicalUrl ?? null,
        word_count: page.wordCount ?? null,
        meta_description: page.metaDescription ?? null
      }))
    );
  }

  const detectedIssues = await detectSeoIssues(pages);
  const issuesWithSuggestions = await addAiSuggestions(detectedIssues);
  const issues = prioritizeSeoIssues(issuesWithSuggestions, pages);

  if (issues.length > 0) {
    await supabase.from("scan_issues").insert(
      issues.map((issue) => ({
        scan_id: scan.id,
        page_url: issue.pageUrl,
        issue_type: issue.issueType,
        severity: issue.severity,
        message: issue.message,
        priority: issue.priority ?? null,
        page_importance: issue.pageImportance ?? null,
        business_impact: issue.businessImpact ?? null,
        fix_difficulty: issue.fixDifficulty ?? null,
        confidence: issue.confidence ?? null,
        estimated_impact: issue.estimatedImpact ?? null,
        exact_fix: issue.exactFix ?? null,
        priority_score: issue.priorityScore ?? null,
        sort_score: issue.sortScore ?? null,
        details: {
          ...(issue.details ?? {}),
          explanation: issue.explanation ?? null,
          suggestedFix: issue.suggestedFix ?? null
        }
      }))
    );

    try {
      const resolutionResult = await planResolutionsForScan(supabase, scan.id, {
        limit: 5
      });

      await supabase.from("events").insert({
        event_name: "resolutions_planned",
        scan_id: scan.id,
        website_url: normalizedUrl,
        metadata: {
          created: resolutionResult.created,
          skipped: resolutionResult.skipped
        }
      });
    } catch (error) {
      await supabase.from("events").insert({
        event_name: "resolution_planning_failed",
        scan_id: scan.id,
        website_url: normalizedUrl,
        metadata: {
          message: error instanceof Error ? error.message : "Unknown error"
        }
      });
    }
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

function sanitizeSubmitDebug(debug: unknown) {
  if (!debug || typeof debug !== "object") {
    return {};
  }

  const sanitized: Record<string, boolean | number | string> = {};
  const entries = Object.entries(debug);
  const numericKeys = new Set([
    "formInputLength",
    "reactStateLength",
    "submittedInputLength"
  ]);
  const stringKeys = new Set([
    "temporaryReason"
  ]);
  const booleanKeys = new Set(["stateAndFormMatched"]);

  for (const [key, value] of entries) {
    if (numericKeys.has(key) && typeof value === "number") {
      sanitized[key] = Math.max(0, Math.min(value, 500));
      continue;
    }

    if (booleanKeys.has(key) && typeof value === "boolean") {
      sanitized[key] = value;
      continue;
    }

    if (stringKeys.has(key) && typeof value === "string") {
      sanitized[key] = value.slice(0, 80);
    }
  }

  return sanitized;
}
