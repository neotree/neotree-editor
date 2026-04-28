'use server';

import { and, eq, isNull } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { _saveEditorInfo } from "@/databases/mutations/editor-info";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import {
  adminAuditLogs,
  dataKeys,
  diagnoses,
  hospitals,
  pendingDeletion,
  problems,
  screens,
  scripts,
} from "@/databases/pg/schema";
import { buildIntegrityBaselineFromSnapshotData } from "@/lib/integrity-baseline";
import {
  EMPTY_INTEGRITY_BASELINE,
  getIntegrityPolicyState,
  IntegrityBaseline,
  normalizeIntegrityPolicy,
  type IntegrityPolicy,
} from "@/lib/integrity-policy";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import type { DataKey } from "@/databases/queries/data-keys";
import type { DiagnosisType, ProblemType, ScreenType } from "@/databases/queries/scripts";

function assertCanManageIntegrityPolicy(user?: { role?: string | null } | null) {
  if (user?.role !== "super_user") {
    throw new Error("Forbidden: only super_user can manage integrity policy settings");
  }
}

async function buildCurrentIntegrityBaseline(policy: IntegrityPolicy, userId?: string | null) {
  const [publishedDataKeysRows, publishedScreensRows, publishedDiagnosesRows, publishedProblemsRows] = await Promise.all([
    db
      .select({
        dataKey: dataKeys,
      })
      .from(dataKeys)
      .leftJoin(pendingDeletion, eq(pendingDeletion.dataKeyId, dataKeys.uuid))
      .where(and(
        isNull(dataKeys.deletedAt),
        isNull(pendingDeletion.id),
      )),
    db
      .select({
        screen: screens,
        scriptTitle: scripts.title,
        hospitalName: hospitals.name,
      })
      .from(screens)
      .leftJoin(pendingDeletion, eq(pendingDeletion.screenId, screens.screenId))
      .leftJoin(scripts, eq(scripts.scriptId, screens.scriptId))
      .leftJoin(hospitals, eq(hospitals.hospitalId, scripts.hospitalId))
      .where(and(
        isNull(screens.deletedAt),
        isNull(pendingDeletion.id),
      )),
    db
      .select({
        diagnosis: diagnoses,
        scriptTitle: scripts.title,
      })
      .from(diagnoses)
      .leftJoin(pendingDeletion, eq(pendingDeletion.diagnosisId, diagnoses.diagnosisId))
      .leftJoin(scripts, eq(scripts.scriptId, diagnoses.scriptId))
      .where(and(
        isNull(diagnoses.deletedAt),
        isNull(pendingDeletion.id),
      )),
    db
      .select({
        problem: problems,
        scriptTitle: scripts.title,
      })
      .from(problems)
      .leftJoin(pendingDeletion, eq(pendingDeletion.problemId, problems.problemId))
      .leftJoin(scripts, eq(scripts.scriptId, problems.scriptId))
      .where(and(
        isNull(problems.deletedAt),
        isNull(pendingDeletion.id),
      )),
  ]);

  const publishedDataKeys = publishedDataKeysRows.map((row) => ({
    ...row.dataKey,
    isDraft: false,
    isDeleted: false,
  })) as DataKey[];

  const publishedScreens = publishedScreensRows.map((row) => ({
    ...row.screen,
    scriptTitle: row.scriptTitle || "",
    hospitalName: row.hospitalName || "",
    isDraft: false,
    isDeleted: false,
  })) as ScreenType[];

  const publishedDiagnoses = publishedDiagnosesRows.map((row) => ({
    ...row.diagnosis,
    scriptTitle: row.scriptTitle || "",
    isDraft: false,
    isDeleted: false,
  })) as DiagnosisType[];

  const publishedProblems = publishedProblemsRows.map((row) => ({
    ...row.problem,
    scriptTitle: row.scriptTitle || "",
    isDraft: false,
    isDeleted: false,
  })) as ProblemType[];

  const baseline: IntegrityBaseline = buildIntegrityBaselineFromSnapshotData({
    policy,
    userId,
    dataKeys: publishedDataKeys,
    screens: publishedScreens,
    diagnoses: publishedDiagnoses,
    problems: publishedProblems,
  });

  return {
    success: true as const,
    baseline,
    errors: [],
  };
}

async function saveIntegrityPolicyAuditLog({
  tx,
  actorUserId,
  action,
  beforeState,
  afterState,
  metadata,
}: {
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0];
  actorUserId?: string | null;
  action: string;
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
  metadata?: Record<string, any>;
}) {
  await tx.insert(adminAuditLogs).values({
    area: "integrity_policy",
    action,
    actorUserId: actorUserId || null,
    beforeState,
    afterState,
    metadata: metadata || {},
  });
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
        increaseVersion: false,
        broadcastAction: false,
        client: tx,
      });

      if (!saved.success || saved.errors?.length) {
        throw new Error(saved.errors?.join(", ") || "Failed to save integrity policy");
      }

      await saveIntegrityPolicyAuditLog({
        tx,
        actorUserId: session.user?.userId,
        action: "policy_updated",
        beforeState: {
          policy: currentState.policy,
        },
        afterState: {
          policy: nextPolicy,
        },
      });

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
        increaseVersion: false,
        broadcastAction: false,
        client: tx,
      });

      if (!saved.success || saved.errors?.length) {
        throw new Error(saved.errors?.join(", ") || "Failed to save integrity baseline");
      }

      await saveIntegrityPolicyAuditLog({
        tx,
        actorUserId: session.user?.userId,
        action: "baseline_captured",
        beforeState: {
          baseline: currentState.baseline,
        },
        afterState: {
          baseline: baselineRes.baseline,
        },
        metadata: {
          totalBlockingIssues: baselineRes.baseline.totalBlockingIssues,
          totalScripts: baselineRes.baseline.totalScripts,
        },
      });

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
        increaseVersion: false,
        broadcastAction: false,
        client: tx,
      });

      if (!saved.success || saved.errors?.length) {
        throw new Error(saved.errors?.join(", ") || "Failed to clear integrity baseline");
      }

      await saveIntegrityPolicyAuditLog({
        tx,
        actorUserId: session.user?.userId,
        action: "baseline_cleared",
        beforeState: {
          baseline: currentState.baseline,
        },
        afterState: {
          baseline: EMPTY_INTEGRITY_BASELINE,
        },
      });

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
