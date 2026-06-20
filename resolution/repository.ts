import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ResolutionOutput,
  ResolutionPlan,
  ScanIssueRecord,
  ScanPageRecord
} from "@/resolution/types";
import { createVerificationExpectation } from "@/resolution/verification";

export async function getScanIssues(
  supabase: SupabaseClient,
  scanId: string
): Promise<ScanIssueRecord[]> {
  const { data, error } = await supabase
    .from("scan_issues")
    .select(
      "id, scan_id, page_url, issue_type, severity, message, priority, page_importance, business_impact, fix_difficulty, confidence, estimated_impact, exact_fix, priority_score, sort_score, details"
    )
    .eq("scan_id", scanId)
    .order("priority_score", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as ScanIssueRecord[];
}

export async function getScanPages(
  supabase: SupabaseClient,
  scanId: string
): Promise<ScanPageRecord[]> {
  const { data, error } = await supabase
    .from("scan_pages")
    .select(
      "id, scan_id, url, title, meta_description, canonical_url, word_count, page_type, importance_score"
    )
    .eq("scan_id", scanId);

  if (error) {
    throw error;
  }

  return (data ?? []) as ScanPageRecord[];
}

export async function saveResolutionPlan(
  supabase: SupabaseClient,
  plan: ResolutionPlan,
  outputs: ResolutionOutput[]
) {
  const now = new Date().toISOString();
  const { data: resolution, error } = await supabase
    .from("seo_resolutions")
    .upsert(
      {
        scan_id: plan.scanId,
        scan_issue_id: plan.issueId,
        page_url: plan.pageUrl,
        issue_type: plan.issueType,
        resolution_type: plan.resolutionType,
        status: plan.status,
        priority: plan.priority,
        priority_score: plan.priorityScore,
        difficulty: plan.difficulty,
        confidence: plan.confidence,
        problem_explanation: plan.problemExplanation,
        business_impact: plan.businessImpact,
        recommended_action: plan.recommendedAction,
        verification_step: plan.verificationStep,
        expected_outcome: plan.expectedOutcome,
        rule_id: plan.ruleId,
        reasons: plan.reasons,
        updated_at: now
      },
      { onConflict: "scan_issue_id" }
    )
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  const resolutionId = resolution.id as string;

  if (outputs.length > 0) {
    const { error: outputError } = await supabase
      .from("seo_resolution_outputs")
      .upsert(
        outputs.map((output) => ({
          resolution_id: resolutionId,
          output_type: output.outputType,
          title: output.title,
          body: output.body,
          content: output.content,
          status: "draft",
          updated_at: now
        })),
        { onConflict: "resolution_id,output_type" }
      );

    if (outputError) {
      throw outputError;
    }
  }

  const expectation = createVerificationExpectation(plan.issueType, plan.pageUrl);
  const { error: verificationError } = await supabase
    .from("seo_resolution_verifications")
    .upsert(
      {
        resolution_id: resolutionId,
        scan_issue_id: plan.issueId,
        status: "pending",
        expected_condition: expectation,
        updated_at: now
      },
      { onConflict: "resolution_id" }
    );

  if (verificationError) {
    throw verificationError;
  }

  const { error: eventError } = await supabase
    .from("seo_resolution_events")
    .insert({
      resolution_id: resolutionId,
      scan_id: plan.scanId,
      scan_issue_id: plan.issueId,
      event_type: "resolution_planned",
      payload: {
        issueType: plan.issueType,
        priority: plan.priority,
        priorityScore: plan.priorityScore,
        ruleId: plan.ruleId
      }
    });

  if (eventError) {
    throw eventError;
  }

  return resolutionId;
}
