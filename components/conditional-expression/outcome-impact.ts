import axios from "axios";

import type { getOutcomeReferenceImpact } from "@/app/actions/scripts";
import type { OutcomeCollectionName } from "@/lib/conditional-expression";

export async function fetchOutcomeReferenceImpact(params: {
  scriptId: string;
  collection: OutcomeCollectionName;
  values: string[];
  excludeDiagnosisIds?: string[];
  excludeProblemIds?: string[];
  sourceEntityId?: string;
}) {
  const response = await axios.get<Awaited<ReturnType<typeof getOutcomeReferenceImpact>>>(
    `/api/scripts/outcome-references?data=${encodeURIComponent(JSON.stringify(params))}`,
  );
  if (response.data.errors?.length) throw new Error(response.data.errors.join(", "));
  return response.data.data;
}

function escapeHtml(value: unknown): string {
  return `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatOutcomeImpactMessage(
  impact: NonNullable<Awaited<ReturnType<typeof fetchOutcomeReferenceImpact>>>,
  action: "rename" | "delete",
): string {
  const locations = impact.findings.slice(0, 8)
    .map((finding) => `<li><a class="underline" href="${escapeHtml(finding.href)}">${escapeHtml(finding.location)} — ${escapeHtml(finding.field)}</a></li>`)
    .join("");
  const more = impact.findings.length > 8
    ? `<li>and ${impact.findings.length - 8} more…</li>`
    : "";
  const outcome = action === "rename"
    ? `The editor will safely update ${impact.occurrences} reference${impact.occurrences === 1 ? "" : "s"} in the same draft.`
    : "Delete is blocked until these references are removed or changed.";
  return `<p>${outcome}</p><ul class="mt-2 list-disc pl-5">${locations}${more}</ul>`;
}
