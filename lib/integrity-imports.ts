import {
  buildDataKeyIntegrityContext,
  getBlockingIntegrityEntries,
  getDataKeyIntegrityEntryFingerprint,
  scanDataKeyIntegrity,
  type DataKeyIntegrityPublishDetails,
  buildDataKeyIntegrityPublishDetails,
} from "@/lib/data-key-integrity";
import {
  INTEGRITY_BASELINE_FINGERPRINT_VERSION,
  INTEGRITY_BASELINE_RULESET_VERSION,
  type IntegrityPolicy,
} from "@/lib/integrity-policy";
import type { DataKey } from "@/databases/queries/data-keys";
import type { DiagnosisType, ProblemType, ScreenType } from "@/databases/queries/scripts";

export type IntegrityImportSnapshotShape = {
  fingerprintVersion: number;
  ruleSetVersion: string;
  totalBlockingIssues: number;
  totalScripts: number;
  fingerprints: string[];
};

const MAX_IMPORT_REVIEW_ISSUES_PER_SCRIPT = 5;

function compactIntegrityImportReviewDetails(
  reviewDetails: DataKeyIntegrityPublishDetails | null,
): DataKeyIntegrityPublishDetails | null {
  if (!reviewDetails) return reviewDetails;

  return {
    ...reviewDetails,
    scripts: reviewDetails.scripts.map((script) => ({
      ...script,
      issues: script.issues.slice(0, MAX_IMPORT_REVIEW_ISSUES_PER_SCRIPT),
      hiddenIssuesCount: Math.max(0, script.totalIssues - MAX_IMPORT_REVIEW_ISSUES_PER_SCRIPT),
    })),
  };
}

export function buildIntegrityImportAnalysis({
  policy,
  dataKeys,
  screens,
  diagnoses,
  problems,
}: {
  policy: IntegrityPolicy;
  dataKeys: DataKey[];
  screens: ScreenType[];
  diagnoses: DiagnosisType[];
  problems: ProblemType[];
}): {
  snapshot: IntegrityImportSnapshotShape;
  reviewDetails: DataKeyIntegrityPublishDetails | null;
} {
  const context = buildDataKeyIntegrityContext(dataKeys);
  const report = scanDataKeyIntegrity({
    dataKeys,
    screens,
    diagnoses,
    problems,
    onlyIssues: true,
    context,
    policy,
  });

  const blockingEntries = getBlockingIntegrityEntries(report.entries);
  const scriptIds = new Set(blockingEntries.map((entry) => entry.scriptId).filter(Boolean));

  return {
    snapshot: {
      fingerprintVersion: INTEGRITY_BASELINE_FINGERPRINT_VERSION,
      ruleSetVersion: INTEGRITY_BASELINE_RULESET_VERSION,
      totalBlockingIssues: blockingEntries.length,
      totalScripts: scriptIds.size,
      fingerprints: Array.from(new Set(blockingEntries.map((entry) => getDataKeyIntegrityEntryFingerprint(entry)))).sort(),
    },
    reviewDetails: compactIntegrityImportReviewDetails(buildDataKeyIntegrityPublishDetails(report)),
  };
}

export function buildIntegrityImportSnapshot({
  policy,
  dataKeys,
  screens,
  diagnoses,
  problems,
}: {
  policy: IntegrityPolicy;
  dataKeys: DataKey[];
  screens: ScreenType[];
  diagnoses: DiagnosisType[];
  problems: ProblemType[];
}): IntegrityImportSnapshotShape {
  return buildIntegrityImportAnalysis({
    policy,
    dataKeys,
    screens,
    diagnoses,
    problems,
  }).snapshot;
}

export function buildIntegrityImportReviewDetails({
  policy,
  dataKeys,
  screens,
  diagnoses,
  problems,
}: {
  policy: IntegrityPolicy;
  dataKeys: DataKey[];
  screens: ScreenType[];
  diagnoses: DiagnosisType[];
  problems: ProblemType[];
}): DataKeyIntegrityPublishDetails | null {
  return buildIntegrityImportAnalysis({
    policy,
    dataKeys,
    screens,
    diagnoses,
    problems,
  }).reviewDetails;
}
