import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  hasSupabaseConfig
} from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    scanId: string;
  }>;
};

type ResolutionOutputRow = {
  id: string;
  output_type: string;
  title: string;
  body: string;
  content: Record<string, unknown>;
  status: string;
};

type ResolutionVerificationRow = {
  id: string;
  status: string;
  failure_reason: string | null;
  checked_at: string | null;
};

type ResolutionRow = {
  id: string;
  scan_id: string;
  scan_issue_id: string;
  page_url: string;
  issue_type: string;
  resolution_type: string;
  status: string;
  priority: string;
  priority_score: number;
  difficulty: string;
  confidence: string;
  problem_explanation: string;
  business_impact: string;
  recommended_action: string;
  verification_step: string;
  expected_outcome: string;
  seo_resolution_outputs?: ResolutionOutputRow[];
};

export async function GET(_request: Request, context: RouteContext) {
  const { scanId } = await context.params;

  if (!scanId) {
    return NextResponse.json({ error: "Missing scan ID." }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Supabase is not configured yet." },
      { status: 503 }
    );
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("seo_resolutions")
    .select(
      `
      id,
      scan_id,
      scan_issue_id,
      page_url,
      issue_type,
      resolution_type,
      status,
      priority,
      priority_score,
      difficulty,
      confidence,
      problem_explanation,
      business_impact,
      recommended_action,
      verification_step,
      expected_outcome,
      seo_resolution_outputs (
        id,
        output_type,
        title,
        body,
        content,
        status
      )
    `
    )
    .eq("scan_id", scanId)
    .order("priority_score", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json(
      { error: "Could not load resolutions." },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as ResolutionRow[];
  const resolutionIds = rows.map((resolution) => resolution.id);
  const verificationsByResolutionId = new Map<string, ResolutionVerificationRow>();

  if (resolutionIds.length > 0) {
    const { data: verificationRows, error: verificationError } = await supabase
      .from("seo_resolution_verifications")
      .select("id, resolution_id, status, failure_reason, checked_at")
      .in("resolution_id", resolutionIds);

    if (verificationError) {
      return NextResponse.json(
        { error: "Could not load resolution verification status." },
        { status: 500 }
      );
    }

    for (const verification of verificationRows ?? []) {
      verificationsByResolutionId.set(
        verification.resolution_id as string,
        verification as ResolutionVerificationRow
      );
    }
  }

  const resolutions = rows.map((resolution) => ({
    id: resolution.id,
    scanId: resolution.scan_id,
    scanIssueId: resolution.scan_issue_id,
    pageUrl: resolution.page_url,
    issueType: resolution.issue_type,
    resolutionType: resolution.resolution_type,
    status: resolution.status,
    priority: resolution.priority,
    priorityScore: resolution.priority_score,
    difficulty: resolution.difficulty,
    confidence: resolution.confidence,
    problemExplanation: resolution.problem_explanation,
    businessImpact: resolution.business_impact,
    recommendedAction: resolution.recommended_action,
    verificationStep: resolution.verification_step,
    expectedOutcome: resolution.expected_outcome,
    outputs: (resolution.seo_resolution_outputs ?? []).map((output) => ({
      id: output.id,
      outputType: output.output_type,
      title: output.title,
      body: output.body,
      content: output.content,
      status: output.status
    })),
    verification: formatVerification(verificationsByResolutionId.get(resolution.id))
  }));

  return NextResponse.json({ resolutions });
}

function formatVerification(verification?: ResolutionVerificationRow) {
  if (!verification) {
    return null;
  }

  return {
    id: verification.id,
    status: verification.status,
    failureReason: verification.failure_reason,
    checkedAt: verification.checked_at
  };
}
