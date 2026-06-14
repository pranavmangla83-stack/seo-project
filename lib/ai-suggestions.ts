import OpenAI from "openai";
import type { SeoIssue } from "@/lib/seo-checks";

type AiIssueSuggestion = {
  issueType: SeoIssue["issueType"];
  pageUrl: string;
  explanation: string;
  suggestedFix: string;
};

const fallbackModel = process.env.OPENAI_MODEL || "gpt-5.5";

export async function addAiSuggestions(issues: SeoIssue[]) {
  if (!process.env.OPENAI_API_KEY || issues.length === 0) {
    return issues;
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: fallbackModel,
      instructions:
        "You explain SEO issues to small business owners. Do not detect new issues. Only explain the provided rule-detected issues and suggest practical fixes in plain language.",
      input: JSON.stringify({
        issues: issues.slice(0, 10).map((issue) => ({
          pageUrl: issue.pageUrl,
          issueType: issue.issueType,
          severity: issue.severity,
          message: issue.message,
          details: issue.details ?? {}
        }))
      }),
      text: {
        format: {
          type: "json_schema",
          name: "seo_issue_suggestions",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    issueType: { type: "string" },
                    pageUrl: { type: "string" },
                    explanation: { type: "string" },
                    suggestedFix: { type: "string" }
                  },
                  required: [
                    "issueType",
                    "pageUrl",
                    "explanation",
                    "suggestedFix"
                  ]
                }
              }
            },
            required: ["suggestions"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.output_text) as {
      suggestions: AiIssueSuggestion[];
    };

    return issues.map((issue) => {
      const suggestion = parsed.suggestions.find(
        (item) =>
          item.issueType === issue.issueType && item.pageUrl === issue.pageUrl
      );

      if (!suggestion) {
        return issue;
      }

      return {
        ...issue,
        explanation: suggestion.explanation,
        suggestedFix: suggestion.suggestedFix
      };
    });
  } catch {
    return issues;
  }
}
