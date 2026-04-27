export type IntegrityEnforcementMode =
  | "off"
  | "warn_only"
  | "block_new_issues_only"
  | "block_all_issues";

export type IntegrityScanScope = "affected_scripts_only" | "full_scope";

export type IntegrityPolicy = {
  enforcementMode: IntegrityEnforcementMode;
  scanScope: IntegrityScanScope;
  triggerSources: {
    scriptEdits: boolean;
    dataKeyLibraryEdits: boolean;
    deletions: boolean;
  };
  useBaseline: boolean;
};

export type IntegrityBaseline = {
  capturedAt: string | null;
  capturedByUserId: string | null;
  totalBlockingIssues: number;
  totalScripts: number;
  fingerprintVersion: number;
  ruleSetVersion: string;
  fingerprints: string[];
};

export type IntegrityPolicyState = {
  policy: IntegrityPolicy;
  baseline: IntegrityBaseline;
};

export type IntegrityPolicyBlockingEvaluationResult<T> = {
  enforcedBlockingEntries: T[];
  warnings: string[];
  policyModeMessage: string;
  baselineState: "not_applicable" | "none" | "outdated" | "active";
};

export type IntegrityFingerprintEntry = {
  scriptId: string;
  kind: string;
  screenId?: string;
  diagnosisId?: string;
  problemId?: string;
  fieldId?: string;
  fieldIndex?: number;
  screenItemId?: string;
  screenItemIndex?: number;
  fieldItemId?: string;
  fieldItemIndex?: number;
  symptomId?: string;
  symptomIndex?: number;
  expectedDataType?: string;
  currentUniqueKey?: string;
  currentKey?: string;
  matchedUniqueKey?: string;
  matchedName?: string;
};

export const DEFAULT_INTEGRITY_POLICY: IntegrityPolicy = {
  enforcementMode: "block_new_issues_only",
  scanScope: "affected_scripts_only",
  triggerSources: {
    scriptEdits: true,
    dataKeyLibraryEdits: false,
    deletions: true,
  },
  useBaseline: true,
};

export const INTEGRITY_BASELINE_FINGERPRINT_VERSION = 1;
export const INTEGRITY_BASELINE_RULESET_VERSION = "2026-04-26";

export const EMPTY_INTEGRITY_BASELINE: IntegrityBaseline = {
  capturedAt: null,
  capturedByUserId: null,
  totalBlockingIssues: 0,
  totalScripts: 0,
  fingerprintVersion: INTEGRITY_BASELINE_FINGERPRINT_VERSION,
  ruleSetVersion: INTEGRITY_BASELINE_RULESET_VERSION,
  fingerprints: [],
};

export function normalizeIntegrityPolicy(
  value?: Partial<IntegrityPolicy> | null,
): IntegrityPolicy {
  const enforcementMode = (
    value?.enforcementMode &&
    ["off", "warn_only", "block_new_issues_only", "block_all_issues"].includes(value.enforcementMode)
      ? value.enforcementMode
      : DEFAULT_INTEGRITY_POLICY.enforcementMode
  ) as IntegrityEnforcementMode;

  return {
    enforcementMode,
    scanScope: (
      value?.scanScope &&
      ["affected_scripts_only", "full_scope"].includes(value.scanScope)
        ? value.scanScope
        : DEFAULT_INTEGRITY_POLICY.scanScope
    ) as IntegrityScanScope,
    triggerSources: {
      scriptEdits: value?.triggerSources?.scriptEdits ?? DEFAULT_INTEGRITY_POLICY.triggerSources.scriptEdits,
      dataKeyLibraryEdits:
        value?.triggerSources?.dataKeyLibraryEdits ??
        DEFAULT_INTEGRITY_POLICY.triggerSources.dataKeyLibraryEdits,
      deletions: value?.triggerSources?.deletions ?? DEFAULT_INTEGRITY_POLICY.triggerSources.deletions,
    },
    useBaseline:
      enforcementMode === "block_new_issues_only"
        ? true
        : value?.useBaseline ?? DEFAULT_INTEGRITY_POLICY.useBaseline,
  };
}

export function normalizeIntegrityBaseline(
  value?: Partial<IntegrityBaseline> | null,
): IntegrityBaseline {
  return {
    capturedAt: value?.capturedAt || null,
    capturedByUserId: value?.capturedByUserId || null,
    totalBlockingIssues:
      typeof value?.totalBlockingIssues === "number" ? value.totalBlockingIssues : 0,
    totalScripts: typeof value?.totalScripts === "number" ? value.totalScripts : 0,
    fingerprintVersion:
      typeof value?.fingerprintVersion === "number"
        ? value.fingerprintVersion
        : INTEGRITY_BASELINE_FINGERPRINT_VERSION,
    ruleSetVersion:
      typeof value?.ruleSetVersion === "string" && value.ruleSetVersion.trim()
        ? value.ruleSetVersion.trim()
        : INTEGRITY_BASELINE_RULESET_VERSION,
    fingerprints: Array.isArray(value?.fingerprints)
      ? value!.fingerprints.filter((item): item is string => typeof item === "string" && !!item)
      : [],
  };
}

export function hasIntegrityBaseline(value?: Partial<IntegrityBaseline> | null) {
  return normalizeIntegrityBaseline(value).fingerprints.length > 0;
}

export function isIntegrityBaselineCompatible(
  value?: Partial<IntegrityBaseline> | null,
) {
  const baseline = normalizeIntegrityBaseline(value);
  return (
    baseline.fingerprintVersion === INTEGRITY_BASELINE_FINGERPRINT_VERSION &&
    baseline.ruleSetVersion === INTEGRITY_BASELINE_RULESET_VERSION
  );
}

export function getIntegrityBaselineLookup(
  value?: Partial<IntegrityBaseline> | null,
) {
  const baseline = normalizeIntegrityBaseline(value);
  if (!isIntegrityBaselineCompatible(baseline)) {
    return new Set<string>();
  }

  return new Set(baseline.fingerprints);
}

export function evaluateIntegrityPolicyBlockingEntries<T>({
  policy,
  baseline,
  blockingEntries,
  getFingerprint,
  issueLabel = "blocking issue",
}: {
  policy: IntegrityPolicy;
  baseline?: Partial<IntegrityBaseline> | null;
  blockingEntries: T[];
  getFingerprint: (entry: T) => string;
  issueLabel?: string;
}): IntegrityPolicyBlockingEvaluationResult<T> {
  const policyModeMessage = `Integrity enforcement mode: ${policy.enforcementMode.replaceAll("_", " ")}.`;
  const warnings: string[] = [];

  if (policy.enforcementMode === "off") {
    return {
      enforcedBlockingEntries: [],
      warnings,
      policyModeMessage,
      baselineState: "not_applicable",
    };
  }

  if (policy.enforcementMode === "warn_only") {
    if (blockingEntries.length) {
      warnings.push(
        `Integrity policy is set to warn only. ${blockingEntries.length} ${issueLabel}${blockingEntries.length === 1 ? "" : "s"} ${blockingEntries.length === 1 ? "was" : "were"} detected but did not block publish.`
      );
    }

    return {
      enforcedBlockingEntries: [],
      warnings,
      policyModeMessage,
      baselineState: "not_applicable",
    };
  }

  if (policy.enforcementMode === "block_all_issues") {
    return {
      enforcedBlockingEntries: blockingEntries,
      warnings,
      policyModeMessage,
      baselineState: "not_applicable",
    };
  }

  if (!hasIntegrityBaseline(baseline)) {
    if (blockingEntries.length) {
      warnings.push(
        "Integrity policy is set to block new issues only, but no baseline has been captured yet. Validation is running in warn-only mode until a baseline is captured."
      );
      warnings.push(
        `${blockingEntries.length} existing ${issueLabel}${blockingEntries.length === 1 ? "" : "s"} ${blockingEntries.length === 1 ? "was" : "were"} detected and allowed because there is no captured baseline yet.`
      );
    }

    return {
      enforcedBlockingEntries: [],
      warnings,
      policyModeMessage,
      baselineState: "none",
    };
  }

  if (!isIntegrityBaselineCompatible(baseline)) {
    if (blockingEntries.length) {
      warnings.push(
        "Integrity policy is set to block new issues only, but the captured baseline is outdated for the current rule set. Validation is running in warn-only mode until a new baseline is captured."
      );
      warnings.push(
        `${blockingEntries.length} ${issueLabel}${blockingEntries.length === 1 ? "" : "s"} ${blockingEntries.length === 1 ? "was" : "were"} detected and allowed because the captured baseline is not compatible with the current rule set.`
      );
    }

    return {
      enforcedBlockingEntries: [],
      warnings,
      policyModeMessage,
      baselineState: "outdated",
    };
  }

  const baselineLookup = getIntegrityBaselineLookup(baseline);
  const enforcedBlockingEntries = blockingEntries.filter((entry) => !baselineLookup.has(getFingerprint(entry)));

  if (blockingEntries.length && !enforcedBlockingEntries.length) {
    warnings.push(
      "Existing baseline integrity issues were detected in scope, but no newly introduced blocking issues were found."
    );
  }

  return {
    enforcedBlockingEntries,
    warnings,
    policyModeMessage,
    baselineState: "active",
  };
}

export function getIntegrityEntryFingerprint(entry: IntegrityFingerprintEntry) {
  return [
    `${entry.scriptId || ""}`.trim(),
    `${entry.kind || ""}`.trim(),
    `${entry.screenId || ""}`.trim(),
    `${entry.diagnosisId || ""}`.trim(),
    `${entry.problemId || ""}`.trim(),
    `${entry.fieldId || ""}`.trim(),
    Number.isInteger(entry.fieldIndex) ? `${entry.fieldIndex}` : "",
    `${entry.screenItemId || ""}`.trim(),
    Number.isInteger(entry.screenItemIndex) ? `${entry.screenItemIndex}` : "",
    `${entry.fieldItemId || ""}`.trim(),
    Number.isInteger(entry.fieldItemIndex) ? `${entry.fieldItemIndex}` : "",
    `${entry.symptomId || ""}`.trim(),
    Number.isInteger(entry.symptomIndex) ? `${entry.symptomIndex}` : "",
    `${entry.expectedDataType || ""}`.trim(),
    `${entry.currentUniqueKey || ""}`.trim(),
    `${entry.currentKey || ""}`.trim(),
    `${entry.matchedUniqueKey || ""}`.trim(),
    `${entry.matchedName || ""}`.trim(),
  ].join("::");
}

export function getIntegrityPolicyState(value?: {
  integrityPolicy?: Partial<IntegrityPolicy> | null;
  integrityBaseline?: Partial<IntegrityBaseline> | null;
} | null): IntegrityPolicyState {
  return {
    policy: normalizeIntegrityPolicy(value?.integrityPolicy),
    baseline: normalizeIntegrityBaseline(value?.integrityBaseline),
  };
}
