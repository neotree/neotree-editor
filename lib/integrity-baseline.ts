import {
  buildDataKeyIntegrityContext,
  getBlockingIntegrityEntries,
  getDataKeyIntegrityEntryFingerprint,
  repairDataKeyIntegrityReferences,
  scanDataKeyIntegrity,
} from "@/lib/data-key-integrity";
import {
  INTEGRITY_BASELINE_FINGERPRINT_VERSION,
  INTEGRITY_BASELINE_RULESET_VERSION,
  type IntegrityBaseline,
  type IntegrityPolicy,
} from "@/lib/integrity-policy";
import type { DataKey } from "@/databases/queries/data-keys";
import type { DiagnosisType, ProblemType, ScreenType } from "@/databases/queries/scripts";

function mergeIntegrityEntityUpdates<T extends Record<string, any>>(
  current: T[],
  updates: T[],
  getId: (item: T) => string | undefined,
) {
  if (!updates.length) return current;

  const updatesMap = new Map(
    updates
      .map((item) => [getId(item), item] as const)
      .filter(([id]) => !!id),
  );

  return current.map((item) => {
    const id = getId(item);
    return (id && updatesMap.get(id)) || item;
  });
}

export function buildIntegrityBaselineFromSnapshotData({
  policy,
  userId,
  dataKeys,
  screens,
  diagnoses,
  problems,
}: {
  policy: IntegrityPolicy;
  userId?: string | null;
  dataKeys: DataKey[];
  screens: ScreenType[];
  diagnoses: DiagnosisType[];
  problems: ProblemType[];
}): IntegrityBaseline {
  const integrityContext = buildDataKeyIntegrityContext(dataKeys);
  const repairs = repairDataKeyIntegrityReferences({
    dataKeys,
    screens,
    diagnoses,
    problems,
    context: integrityContext,
  });

  const repairedScreens = mergeIntegrityEntityUpdates(screens, repairs.screens, (item) => item.screenId);
  const repairedDiagnoses = mergeIntegrityEntityUpdates(diagnoses, repairs.diagnoses, (item) => item.diagnosisId);
  const repairedProblems = mergeIntegrityEntityUpdates(problems, repairs.problems, (item) => item.problemId);

  const report = scanDataKeyIntegrity({
    dataKeys,
    screens: repairedScreens,
    diagnoses: repairedDiagnoses,
    problems: repairedProblems,
    onlyIssues: true,
    context: integrityContext,
    policy,
  });

  const blockingEntries = getBlockingIntegrityEntries(report.entries);
  const scriptIds = new Set(blockingEntries.map((entry) => entry.scriptId).filter(Boolean));

  return {
    capturedAt: new Date().toISOString(),
    capturedByUserId: userId || null,
    totalBlockingIssues: blockingEntries.length,
    totalScripts: scriptIds.size,
    fingerprintVersion: INTEGRITY_BASELINE_FINGERPRINT_VERSION,
    ruleSetVersion: INTEGRITY_BASELINE_RULESET_VERSION,
    fingerprints: Array.from(
      new Set(blockingEntries.map((entry) => getDataKeyIntegrityEntryFingerprint(entry))),
    ).sort(),
  };
}
