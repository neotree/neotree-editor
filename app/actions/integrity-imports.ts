'use server';

import { eq } from "drizzle-orm";

import db from "@/databases/pg/drizzle";
import { integrityImportSnapshots, adminAuditLogs } from "@/databases/pg/schema";
import logger from "@/lib/logger";
import { isAllowed } from "./is-allowed";
import {
  mergeAcceptedImportFingerprintsIntoIntegrityBaseline,
  removeAcceptedImportFingerprintsFromIntegrityBaseline,
  type IntegrityPolicy,
} from "@/lib/integrity-policy";
import { buildIntegrityImportSnapshot, buildIntegrityImportReviewDetails } from "@/lib/integrity-imports";
import { prepareImportSnapshotAcceptance, removeAcceptedScriptIds } from "@/lib/integrity-import-acceptance";
import type { DataKey } from "@/databases/queries/data-keys";
import type { DiagnosisType, ProblemType, ScreenType } from "@/databases/queries/scripts";
import { _saveEditorInfo } from "@/databases/mutations/editor-info";

function assertCanManageImportIntegrity(user?: { role?: string | null } | null) {
  const role = `${user?.role || ""}`.trim();
  if (!["admin", "super_user"].includes(role)) {
    throw new Error("Forbidden: only admin or super_user can manage import integrity reviews");
  }
}

function normalizeImportSnapshotMetadata(metadata?: Record<string, any> | null) {
  return (metadata && typeof metadata === "object" ? metadata : {}) as Record<string, any>;
}

export async function createIntegrityImportSnapshot({
  actorUserId,
  policy,
  sourceType,
  sourceLabel,
  importedScriptIds,
  importedDataKeyIds,
  metadata,
  dataKeys,
  screens,
  diagnoses,
  problems,
}: {
  actorUserId?: string | null;
  policy: IntegrityPolicy;
  sourceType: string;
  sourceLabel?: string | null;
  importedScriptIds: string[];
  importedDataKeyIds?: string[];
  metadata?: Record<string, any>;
  dataKeys: DataKey[];
  screens: ScreenType[];
  diagnoses: DiagnosisType[];
  problems: ProblemType[];
}) {
  const snapshot = buildIntegrityImportSnapshot({
    policy,
    dataKeys,
    screens,
    diagnoses,
    problems,
  });
  const reviewDetails = buildIntegrityImportReviewDetails({
    policy,
    dataKeys,
    screens,
    diagnoses,
    problems,
  });

  if (!snapshot.totalBlockingIssues) {
    return {
      success: true as const,
      snapshotId: null,
      snapshot,
      reviewDetails,
    };
  }

  const inserted = await db.insert(integrityImportSnapshots).values({
    status: "pending_review",
    sourceType,
    sourceLabel: sourceLabel || null,
    importedScriptIds,
    importedDataKeyIds: importedDataKeyIds || [],
    fingerprintVersion: snapshot.fingerprintVersion,
    ruleSetVersion: snapshot.ruleSetVersion,
    totalBlockingIssues: snapshot.totalBlockingIssues,
    totalScripts: snapshot.totalScripts,
    fingerprints: snapshot.fingerprints,
    metadata: {
      ...(metadata || {}),
      reviewDetails,
      acceptedScriptIds: [],
    },
    createdByUserId: actorUserId || null,
  }).returning({
    snapshotId: integrityImportSnapshots.snapshotId,
  });

  return {
    success: true as const,
    snapshotId: inserted[0]?.snapshotId || null,
    snapshot,
    reviewDetails,
  };
}

export async function acceptIntegrityImportSnapshot(
  params: string | { snapshotId: string; scriptIds?: string[] }
) {
  try {
    const session = await isAllowed();
    assertCanManageImportIntegrity(session.user);

    const snapshotId = typeof params === "string" ? params : params.snapshotId;
    const requestedScriptIds = typeof params === "string" ? undefined : params.scriptIds;

    const existing = await db.query.integrityImportSnapshots.findFirst({
      where: eq(integrityImportSnapshots.snapshotId, snapshotId),
    });

    if (!existing) {
      return { success: false, errors: ["Import review snapshot not found"] };
    }

    const importedScriptIds = Array.isArray(existing.importedScriptIds) ? existing.importedScriptIds : [];
    const existingFingerprints = Array.isArray(existing.fingerprints)
      ? existing.fingerprints.filter((value): value is string => typeof value === "string" && !!value)
      : [];
    const existingMetadata = normalizeImportSnapshotMetadata(existing.metadata);
    const {
      selectedScriptIds,
      selectedFingerprints,
      nextAcceptedScriptIds,
      isFullAcceptance,
      reviewDetails,
    } = prepareImportSnapshotAcceptance({
      importedScriptIds,
      existingFingerprints,
      existingMetadata,
      requestedScriptIds,
    });

    if (!selectedScriptIds.length) {
      return { success: false, errors: ["No matching imported scripts were selected for acceptance"] };
    }

    if (!selectedFingerprints.length) {
      return { success: false, errors: ["No blocking imported issues were found for the selected scripts"] };
    }
    const alreadyAcceptedScriptIds = Array.isArray(existingMetadata.acceptedScriptIds)
      ? existingMetadata.acceptedScriptIds.filter((value): value is string => typeof value === "string" && !!value)
      : [];

    await db.transaction(async (tx) => {
      const currentEditorInfo = await tx.query.editorInfo.findFirst();
      const nextBaseline = mergeAcceptedImportFingerprintsIntoIntegrityBaseline(
        currentEditorInfo?.integrityBaseline as Record<string, any> | null | undefined,
        selectedFingerprints,
      );

      if (!requestedScriptIds?.length || isFullAcceptance) {
        await tx
          .update(integrityImportSnapshots)
          .set({
            status: "accepted",
            acceptedByUserId: session.user?.userId || null,
            acceptedAt: new Date(),
            metadata: {
              ...existingMetadata,
              acceptedScriptIds: nextAcceptedScriptIds,
            },
          })
          .where(eq(integrityImportSnapshots.snapshotId, snapshotId));
      } else {
        await tx
          .update(integrityImportSnapshots)
          .set({
            metadata: {
              ...existingMetadata,
              acceptedScriptIds: nextAcceptedScriptIds,
            },
          })
          .where(eq(integrityImportSnapshots.snapshotId, snapshotId));

        await tx.insert(integrityImportSnapshots).values({
          status: "accepted",
          sourceType: existing.sourceType,
          sourceLabel: existing.sourceLabel,
          importedScriptIds: selectedScriptIds,
          importedDataKeyIds: Array.isArray(existing.importedDataKeyIds) ? existing.importedDataKeyIds : [],
          fingerprintVersion: existing.fingerprintVersion,
          ruleSetVersion: existing.ruleSetVersion,
          totalBlockingIssues: selectedFingerprints.length,
          totalScripts: selectedScriptIds.length,
          fingerprints: selectedFingerprints,
          metadata: {
            parentSnapshotId: snapshotId,
            reviewDetails,
            acceptedScriptIds: selectedScriptIds,
          },
          createdByUserId: existing.createdByUserId,
          acceptedByUserId: session.user?.userId || null,
          acceptedAt: new Date(),
        });
      }

      const savedEditorInfo = await _saveEditorInfo({
        data: {
          integrityBaseline: nextBaseline,
        },
        increaseVersion: false,
        broadcastAction: false,
        client: tx,
      });

      if (!savedEditorInfo.success || savedEditorInfo.errors?.length) {
        throw new Error(savedEditorInfo.errors?.join(", ") || "Failed to update integrity baseline after accepting import issues");
      }

      await tx.insert(adminAuditLogs).values({
        area: "integrity_imports",
        action: requestedScriptIds?.length ? "import_snapshot_partially_accepted" : "import_snapshot_accepted",
        actorUserId: session.user?.userId || null,
        beforeState: {
          status: existing.status,
          totalBlockingIssues: existing.totalBlockingIssues,
          acceptedScriptIds: alreadyAcceptedScriptIds,
        },
        afterState: {
          status: (!requestedScriptIds?.length || isFullAcceptance) ? "accepted" : existing.status,
          totalBlockingIssues: selectedFingerprints.length,
          acceptedScriptIds: nextAcceptedScriptIds,
        },
        metadata: {
          snapshotId,
          sourceType: existing.sourceType,
          sourceLabel: existing.sourceLabel,
          importedScriptIds: existing.importedScriptIds,
          importedDataKeyIds: existing.importedDataKeyIds,
          selectedScriptIds,
        },
      });
    });

    return { success: true, errors: [] };
  } catch (e: any) {
    logger.error("acceptIntegrityImportSnapshot ERROR", e.message);
    return { success: false, errors: [e.message] };
  }
}

export async function revokeIntegrityImportSnapshot(snapshotId: string) {
  try {
    const session = await isAllowed();
    assertCanManageImportIntegrity(session.user);

    const existing = await db.query.integrityImportSnapshots.findFirst({
      where: eq(integrityImportSnapshots.snapshotId, snapshotId),
    });

    if (!existing) {
      return { success: false, errors: ["Accepted import snapshot not found"] };
    }

    await db.transaction(async (tx) => {
      const existingMetadata = normalizeImportSnapshotMetadata(existing.metadata);
      const parentSnapshotId = `${existingMetadata.parentSnapshotId || ""}`.trim();
      const revokedScriptIds = Array.isArray(existing.importedScriptIds)
        ? existing.importedScriptIds.filter((value): value is string => typeof value === "string" && !!value)
        : [];
      const revokedFingerprints = Array.isArray(existing.fingerprints)
        ? existing.fingerprints.filter((value): value is string => typeof value === "string" && !!value)
        : [];

      if (parentSnapshotId && revokedScriptIds.length) {
        const parentSnapshot = await tx.query.integrityImportSnapshots.findFirst({
          where: eq(integrityImportSnapshots.snapshotId, parentSnapshotId),
        });

        if (parentSnapshot) {
          await tx
            .update(integrityImportSnapshots)
            .set({
              metadata: removeAcceptedScriptIds(parentSnapshot.metadata as Record<string, any> | null | undefined, revokedScriptIds),
            })
            .where(eq(integrityImportSnapshots.snapshotId, parentSnapshotId));
        }
      }

      const currentEditorInfo = await tx.query.editorInfo.findFirst();
      const nextBaseline = removeAcceptedImportFingerprintsFromIntegrityBaseline(
        currentEditorInfo?.integrityBaseline as Record<string, any> | null | undefined,
        revokedFingerprints,
      );

      const savedEditorInfo = await _saveEditorInfo({
        data: {
          integrityBaseline: nextBaseline,
        },
        increaseVersion: false,
        broadcastAction: false,
        client: tx,
      });

      if (!savedEditorInfo.success || savedEditorInfo.errors?.length) {
        throw new Error(savedEditorInfo.errors?.join(", ") || "Failed to update integrity baseline after revoking import issues");
      }

      await tx
        .update(integrityImportSnapshots)
        .set({
          status: "rejected",
        })
        .where(eq(integrityImportSnapshots.snapshotId, snapshotId));

      await tx.insert(adminAuditLogs).values({
        area: "integrity_imports",
        action: "import_snapshot_revoked",
        actorUserId: session.user?.userId || null,
        beforeState: {
          status: existing.status,
          totalBlockingIssues: existing.totalBlockingIssues,
        },
        afterState: {
          status: "rejected",
          totalBlockingIssues: existing.totalBlockingIssues,
        },
        metadata: {
          snapshotId,
          parentSnapshotId: parentSnapshotId || null,
          sourceType: existing.sourceType,
          sourceLabel: existing.sourceLabel,
          importedScriptIds: existing.importedScriptIds,
          importedDataKeyIds: existing.importedDataKeyIds,
        },
      });
    });

    return { success: true, errors: [] };
  } catch (e: any) {
    logger.error("revokeIntegrityImportSnapshot ERROR", e.message);
    return { success: false, errors: [e.message] };
  }
}

export async function getAcceptedImportFingerprintLookup(scriptIds?: string[]) {
  const rows = await db.query.integrityImportSnapshots.findMany({
    where: eq(integrityImportSnapshots.status, "accepted"),
  });

  const scopedRows = scriptIds?.length
    ? rows.filter((row) => {
        const importedScriptIds = Array.isArray(row.importedScriptIds) ? row.importedScriptIds : [];
        return importedScriptIds.some((scriptId) => scriptIds.includes(scriptId));
      })
    : rows;

  return new Set(
    scopedRows.flatMap((row) => (
      Array.isArray(row.fingerprints)
        ? row.fingerprints.filter((value): value is string => typeof value === "string" && !!value)
        : []
    )),
  );
}

export async function getAcceptedImportScriptAllowanceLookup(scriptIds?: string[]) {
  const rows = await db.query.integrityImportSnapshots.findMany({
    where: eq(integrityImportSnapshots.status, "accepted"),
  });

  const scopedRows = scriptIds?.length
    ? rows.filter((row) => {
        const importedScriptIds = Array.isArray(row.importedScriptIds) ? row.importedScriptIds : [];
        return importedScriptIds.some((scriptId) => scriptIds.includes(scriptId));
      })
    : rows;

  const lookup = new Map<string, string>();

  scopedRows.forEach((row) => {
    const acceptedAtIso = row.acceptedAt ? new Date(row.acceptedAt).toISOString() : null;
    if (!acceptedAtIso) return;

    const importedScriptIds = Array.isArray(row.importedScriptIds)
      ? row.importedScriptIds.filter((value): value is string => typeof value === "string" && !!value)
      : [];

    importedScriptIds.forEach((scriptId) => {
      const currentAcceptedAt = lookup.get(scriptId);
      if (!currentAcceptedAt || acceptedAtIso > currentAcceptedAt) {
        lookup.set(scriptId, acceptedAtIso);
      }
    });
  });

  return lookup;
}
