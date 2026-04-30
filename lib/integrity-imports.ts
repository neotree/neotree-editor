import {
  buildDataKeyIntegrityContext,
  getBlockingIntegrityEntries,
  getDataKeyIntegrityEntryFingerprint,
  repairDataKeyIntegrityReferences,
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
  const context = buildDataKeyIntegrityContext(dataKeys);
  const repairs = repairDataKeyIntegrityReferences({
    dataKeys,
    screens,
    diagnoses,
    problems,
    context,
  });

  const repairedScreens = screens.map((screen) => repairs.screens.find((item) => item.screenId === screen.screenId) || screen);
  const repairedDiagnoses = diagnoses.map((diagnosis) => repairs.diagnoses.find((item) => item.diagnosisId === diagnosis.diagnosisId) || diagnosis);
  const repairedProblems = problems.map((problem) => repairs.problems.find((item) => item.problemId === problem.problemId) || problem);

  const report = scanDataKeyIntegrity({
    dataKeys,
    screens: repairedScreens,
    diagnoses: repairedDiagnoses,
    problems: repairedProblems,
    onlyIssues: true,
    context,
    policy,
  });

  const blockingEntries = getBlockingIntegrityEntries(report.entries);
  const scriptIds = new Set(blockingEntries.map((entry) => entry.scriptId).filter(Boolean));

  return {
    fingerprintVersion: INTEGRITY_BASELINE_FINGERPRINT_VERSION,
    ruleSetVersion: INTEGRITY_BASELINE_RULESET_VERSION,
    totalBlockingIssues: blockingEntries.length,
    totalScripts: scriptIds.size,
    fingerprints: Array.from(new Set(blockingEntries.map((entry) => getDataKeyIntegrityEntryFingerprint(entry)))).sort(),
  };
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
  const context = buildDataKeyIntegrityContext(dataKeys);
  const repairs = repairDataKeyIntegrityReferences({
    dataKeys,
    screens,
    diagnoses,
    problems,
    context,
  });

  const repairedScreens = screens.map((screen) => repairs.screens.find((item) => item.screenId === screen.screenId) || screen);
  const repairedDiagnoses = diagnoses.map((diagnosis) => repairs.diagnoses.find((item) => item.diagnosisId === diagnosis.diagnosisId) || diagnosis);
  const repairedProblems = problems.map((problem) => repairs.problems.find((item) => item.problemId === problem.problemId) || problem);

  const report = scanDataKeyIntegrity({
    dataKeys,
    screens: repairedScreens,
    diagnoses: repairedDiagnoses,
    problems: repairedProblems,
    onlyIssues: true,
    context,
    policy,
  });

  return buildDataKeyIntegrityPublishDetails(report);
}
