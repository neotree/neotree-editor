import {
  buildDataKeyIntegrityContext,
  getBlockingIntegrityEntries,
  getDataKeyIntegrityEntryFingerprint,
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
  const report = scanDataKeyIntegrity({
    dataKeys,
    screens,
    diagnoses,
    problems,
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
    acceptedImportFingerprints: [],
    acceptedImportFingerprintRefs: {},
  };
}
