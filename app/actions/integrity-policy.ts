'use server';

import db from "@/databases/pg/drizzle";
import { _saveEditorInfo } from "@/databases/mutations/editor-info";
import { _saveChangeLog } from "@/databases/mutations/changelogs/_save-change-log";
import { _getDataKeys } from "@/databases/queries/data-keys";
import { _getDiagnoses, _getProblems, _getScreens } from "@/databases/queries/scripts";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import {
  buildDataKeyIntegrityContext,
  getBlockingIntegrityEntries,
  getDataKeyIntegrityEntryFingerprint,
  scanDataKeyIntegrity,
} from "@/lib/data-key-integrity";
import {
  EMPTY_INTEGRITY_BASELINE,
  INTEGRITY_BASELINE_FINGERPRINT_VERSION,
  INTEGRITY_POLICY_AUDIT_ENTITY_ID,
  INTEGRITY_BASELINE_RULESET_VERSION,
  getIntegrityPolicyState,
  normalizeIntegrityPolicy,
  type IntegrityBaseline,
  type IntegrityPolicy,
} from "@/lib/integrity-policy";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";

function assertCanManageIntegrityPolicy(user?: { role?: string | null } | null) {
  if (user?.role !== "super_user") {
    throw new Error("Forbidden: only super_user can manage integrity policy settings");
  }
}

async function buildCurrentIntegrityBaseline(policy: IntegrityPolicy, userId?: string | null) {
  const [editorInfoRes, dataKeysRes, screensRes, diagnosesRes, problemsRes] = await Promise.all([
    _getEditorInfo(),
    _getDataKeys({ returnDraftsIfExist: false }),
    _getScreens({ returnDraftsIfExist: false }),
    _getDiagnoses({ returnDraftsIfExist: false }),
    _getProblems({ returnDraftsIfExist: false }),
  ]);

  const errors = [
    ...(editorInfoRes.errors || []),
    ...(dataKeysRes.errors || []),
    ...(screensRes.errors || []),
    ...(diagnosesRes.errors || []),
    ...(problemsRes.errors || []),
  ];

  if (errors.length) {
    return {
      success: false as const,
      baseline: null,
      errors,
    };
  }

  const integrityContext = buildDataKeyIntegrityContext(dataKeysRes.data);
  const report = scanDataKeyIntegrity({
    dataKeys: dataKeysRes.data,
    screens: screensRes.data,
    diagnoses: diagnosesRes.data,
    problems: problemsRes.data,
    onlyIssues: true,
    context: integrityContext,
    policy,
  });

  const blockingEntries = getBlockingIntegrityEntries(report.entries, policy);
  const scriptIds = new Set(blockingEntries.map((entry) => entry.scriptId).filter(Boolean));
  const baseline: IntegrityBaseline = {
    capturedAt: new Date().toISOString(),
    capturedByUserId: userId || null,
    totalBlockingIssues: blockingEntries.length,
    totalScripts: scriptIds.size,
    fingerprintVersion: INTEGRITY_BASELINE_FINGERPRINT_VERSION,
    ruleSetVersion: INTEGRITY_BASELINE_RULESET_VERSION,
    fingerprints: Array.from(new Set(blockingEntries.map((entry) => getDataKeyIntegrityEntryFingerprint(entry)))).sort(),
  };

  return {
    success: true as const,
    baseline,
    editorInfo: editorInfoRes.data,
    errors: [],
  };
}

export async function saveIntegrityPolicySettings(policyInput: Partial<IntegrityPolicy>) {
  try {
    const session = await isAllowed();
    assertCanManageIntegrityPolicy(session.user);

    const editorInfoRes = await _getEditorInfo();
    if (editorInfoRes.errors?.length) {
      return { success: false, data: null, errors: editorInfoRes.errors };
    }

    const currentState = getIntegrityPolicyState(editorInfoRes.data);
    const nextPolicy = normalizeIntegrityPolicy({
      ...currentState.policy,
      ...policyInput,
      triggerSources: {
        ...currentState.policy.triggerSources,
        ...(policyInput.triggerSources || {}),
      },
    });

    const txResult = await db.transaction(async (tx) => {
      const saved = await _saveEditorInfo({
        data: {
          integrityPolicy: nextPolicy,
        },
        broadcastAction: false,
        client: tx,
      });

      if (!saved.success || saved.errors?.length) {
        throw new Error(saved.errors?.join(", ") || "Failed to save integrity policy");
      }

      const audit = await _saveChangeLog({
        data: {
          entityId: INTEGRITY_POLICY_AUDIT_ENTITY_ID,
          entityType: "release",
          action: "update",
          userId: session.user?.userId || "",
          description: "Integrity policy settings updated",
          changeReason: "Integrity policy settings updated",
          changes: [
            {
              field: "integrityPolicy",
              previousValue: currentState.policy,
              newValue: nextPolicy,
            },
          ],
          fullSnapshot: {
            integrityPolicy: nextPolicy,
            integrityBaseline: currentState.baseline,
          },
          previousSnapshot: {
            integrityPolicy: currentState.policy,
            integrityBaseline: currentState.baseline,
          },
          baselineSnapshot: {
            integrityPolicy: nextPolicy,
            integrityBaseline: currentState.baseline,
          },
          isActive: false,
        },
        client: tx,
      });

      if (!audit.success || audit.errors?.length) {
        throw new Error(audit.errors?.join(", ") || "Failed to save integrity policy audit log");
      }

      return saved;
    }).catch((error: any) => ({
      success: false,
      data: null,
      errors: [error?.message || "Failed to save integrity policy"],
    }));

    if (!txResult.success || txResult.errors?.length) {
      return { success: false, data: null, errors: txResult.errors || ["Failed to save integrity policy"] };
    }

    return {
      success: true,
      data: {
        policy: nextPolicy,
        baseline: currentState.baseline,
      },
      errors: [],
    };
  } catch (e: any) {
    logger.error("saveIntegrityPolicySettings ERROR", e.message);
    return { success: false, data: null, errors: [e.message] };
  }
}

export async function captureIntegrityPolicyBaseline() {
  try {
    const session = await isAllowed();
    assertCanManageIntegrityPolicy(session.user);

    const editorInfoRes = await _getEditorInfo();
    if (editorInfoRes.errors?.length) {
      return { success: false, data: null, errors: editorInfoRes.errors };
    }

    const { policy } = getIntegrityPolicyState(editorInfoRes.data);
    const baselineRes = await buildCurrentIntegrityBaseline(policy, session.user?.userId);
    if (!baselineRes.success || !baselineRes.baseline) {
      return { success: false, data: null, errors: baselineRes.errors };
    }

    const currentState = getIntegrityPolicyState(editorInfoRes.data);
    const txResult = await db.transaction(async (tx) => {
      const saved = await _saveEditorInfo({
        data: {
          integrityBaseline: baselineRes.baseline,
        },
        broadcastAction: false,
        client: tx,
      });

      if (!saved.success || saved.errors?.length) {
        throw new Error(saved.errors?.join(", ") || "Failed to save integrity baseline");
      }

      const audit = await _saveChangeLog({
        data: {
          entityId: INTEGRITY_POLICY_AUDIT_ENTITY_ID,
          entityType: "release",
          action: "update",
          userId: session.user?.userId || "",
          description: "Integrity baseline captured",
          changeReason: "Integrity baseline captured",
          changes: [
            {
              field: "integrityBaseline",
              previousValue: currentState.baseline,
              newValue: baselineRes.baseline,
            },
          ],
          fullSnapshot: {
            integrityPolicy: currentState.policy,
            integrityBaseline: baselineRes.baseline,
          },
          previousSnapshot: {
            integrityPolicy: currentState.policy,
            integrityBaseline: currentState.baseline,
          },
          baselineSnapshot: {
            integrityPolicy: currentState.policy,
            integrityBaseline: baselineRes.baseline,
          },
          isActive: false,
        },
        client: tx,
      });

      if (!audit.success || audit.errors?.length) {
        throw new Error(audit.errors?.join(", ") || "Failed to save integrity baseline audit log");
      }

      return saved;
    }).catch((error: any) => ({
      success: false,
      data: null,
      errors: [error?.message || "Failed to save integrity baseline"],
    }));

    if (!txResult.success || txResult.errors?.length) {
      return { success: false, data: null, errors: txResult.errors || ["Failed to save integrity baseline"] };
    }

    return {
      success: true,
      data: {
        policy,
        baseline: baselineRes.baseline,
      },
      errors: [],
    };
  } catch (e: any) {
    logger.error("captureIntegrityPolicyBaseline ERROR", e.message);
    return { success: false, data: null, errors: [e.message] };
  }
}

export async function clearIntegrityPolicyBaseline() {
  try {
    const session = await isAllowed();
    assertCanManageIntegrityPolicy(session.user);

    const editorInfoRes = await _getEditorInfo();
    if (editorInfoRes.errors?.length) {
      return { success: false, data: null, errors: editorInfoRes.errors };
    }

    const currentState = getIntegrityPolicyState(editorInfoRes.data);
    const { policy } = currentState;
    const txResult = await db.transaction(async (tx) => {
      const saved = await _saveEditorInfo({
        data: {
          integrityBaseline: EMPTY_INTEGRITY_BASELINE,
        },
        broadcastAction: false,
        client: tx,
      });

      if (!saved.success || saved.errors?.length) {
        throw new Error(saved.errors?.join(", ") || "Failed to clear integrity baseline");
      }

      const audit = await _saveChangeLog({
        data: {
          entityId: INTEGRITY_POLICY_AUDIT_ENTITY_ID,
          entityType: "release",
          action: "delete",
          userId: session.user?.userId || "",
          description: "Integrity baseline cleared",
          changeReason: "Integrity baseline cleared",
          changes: [
            {
              field: "integrityBaseline",
              previousValue: currentState.baseline,
              newValue: EMPTY_INTEGRITY_BASELINE,
            },
          ],
          fullSnapshot: {
            integrityPolicy: currentState.policy,
            integrityBaseline: EMPTY_INTEGRITY_BASELINE,
          },
          previousSnapshot: {
            integrityPolicy: currentState.policy,
            integrityBaseline: currentState.baseline,
          },
          baselineSnapshot: {
            integrityPolicy: currentState.policy,
            integrityBaseline: EMPTY_INTEGRITY_BASELINE,
          },
          isActive: false,
        },
        client: tx,
      });

      if (!audit.success || audit.errors?.length) {
        throw new Error(audit.errors?.join(", ") || "Failed to save integrity baseline audit log");
      }

      return saved;
    }).catch((error: any) => ({
      success: false,
      data: null,
      errors: [error?.message || "Failed to clear integrity baseline"],
    }));

    if (!txResult.success || txResult.errors?.length) {
      return { success: false, data: null, errors: txResult.errors || ["Failed to clear integrity baseline"] };
    }

    return {
      success: true,
      data: {
        policy,
        baseline: EMPTY_INTEGRITY_BASELINE,
      },
      errors: [],
    };
  } catch (e: any) {
    logger.error("clearIntegrityPolicyBaseline ERROR", e.message);
    return { success: false, data: null, errors: [e.message] };
  }
}
