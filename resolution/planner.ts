import type { SupabaseClient } from "@supabase/supabase-js";
import { createResolutionOutputs } from "@/resolution/generator";
import {
  getScanIssues,
  getScanPages,
  saveResolutionPlan
} from "@/resolution/repository";
import { createResolutionPlan } from "@/resolution/rules";
import type { ScanIssueRecord, ScanPageRecord } from "@/resolution/types";

export type PlanResolutionsResult = {
  created: number;
  skipped: number;
  resolutionIds: string[];
};

export async function planResolutionsForScan(
  supabase: SupabaseClient,
  scanId: string,
  options: { limit?: number } = {}
): Promise<PlanResolutionsResult> {
  const [issues, pages] = await Promise.all([
    getScanIssues(supabase, scanId),
    getScanPages(supabase, scanId)
  ]);

  return planResolutionsFromIssues(supabase, issues, pages, options);
}

export async function planResolutionsFromIssues(
  supabase: SupabaseClient,
  issues: ScanIssueRecord[],
  pages: ScanPageRecord[],
  options: { limit?: number } = {}
): Promise<PlanResolutionsResult> {
  const pageByUrl = new Map(pages.map((page) => [page.url, page]));
  const sortedIssues = [...issues].sort(
    (a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0)
  );
  const limit = options.limit ?? 5;
  const resolutionIds: string[] = [];
  let skipped = 0;

  for (const issue of sortedIssues) {
    if (resolutionIds.length >= limit) {
      break;
    }

    const input = {
      issue,
      page: pageByUrl.get(issue.page_url)
    };
    const plan = createResolutionPlan(input);

    if (!plan) {
      skipped += 1;
      continue;
    }

    const outputs = await createResolutionOutputs(plan, input);
    const resolutionId = await saveResolutionPlan(supabase, plan, outputs);
    resolutionIds.push(resolutionId);
  }

  return {
    created: resolutionIds.length,
    skipped,
    resolutionIds
  };
}
