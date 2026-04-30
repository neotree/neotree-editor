import type { DataKeyIntegrityPublishDetails } from "@/lib/data-key-integrity";

function normalizeImportSnapshotMetadata(metadata?: Record<string, any> | null) {
  return (metadata && typeof metadata === "object" ? metadata : {}) as Record<string, any>;
}

export function removeAcceptedScriptIds(existingMetadata: Record<string, any> | null | undefined, scriptIds: string[]) {
  const normalizedMetadata = normalizeImportSnapshotMetadata(existingMetadata);
  const acceptedScriptIds = Array.isArray(normalizedMetadata.acceptedScriptIds)
    ? normalizedMetadata.acceptedScriptIds.filter((value): value is string => typeof value === "string" && !!value)
    : [];

  return {
    ...normalizedMetadata,
    acceptedScriptIds: acceptedScriptIds.filter((scriptId) => !scriptIds.includes(scriptId)),
  };
}

export function filterFingerprintsByScriptIds(fingerprints: string[], scriptIds: string[]) {
  const prefixes = scriptIds.map((scriptId) => `${scriptId}::`);
  return fingerprints.filter((fingerprint) => prefixes.some((prefix) => fingerprint.startsWith(prefix)));
}

export function filterReviewDetailsByScriptIds(
  reviewDetails: DataKeyIntegrityPublishDetails | null | undefined,
  scriptIds: string[],
): DataKeyIntegrityPublishDetails | null {
  if (!reviewDetails) return null;
  const scripts = reviewDetails.scripts.filter((script) => scriptIds.includes(script.scriptId));
  if (!scripts.length) return null;
  return {
    ...reviewDetails,
    totalScripts: scripts.length,
    totalIssues: scripts.reduce((sum, script) => sum + script.totalIssues, 0),
    scripts,
  };
}

export function prepareImportSnapshotAcceptance({
  importedScriptIds,
  existingFingerprints,
  existingMetadata,
  requestedScriptIds,
}: {
  importedScriptIds: string[];
  existingFingerprints: string[];
  existingMetadata?: Record<string, any> | null;
  requestedScriptIds?: string[];
}) {
  const selectedScriptIds = (requestedScriptIds?.length ? requestedScriptIds : importedScriptIds)
    .filter((scriptId): scriptId is string => importedScriptIds.includes(scriptId));

  if (!selectedScriptIds.length) {
    return {
      selectedScriptIds: [],
      selectedFingerprints: [],
      nextAcceptedScriptIds: [] as string[],
      isFullAcceptance: false,
      reviewDetails: null as DataKeyIntegrityPublishDetails | null,
    };
  }

  const selectedFingerprints = filterFingerprintsByScriptIds(existingFingerprints, selectedScriptIds);
  const normalizedMetadata = normalizeImportSnapshotMetadata(existingMetadata);
  const alreadyAcceptedScriptIds = Array.isArray(normalizedMetadata.acceptedScriptIds)
    ? normalizedMetadata.acceptedScriptIds.filter((value): value is string => typeof value === "string" && !!value)
    : [];
  const nextAcceptedScriptIds = Array.from(new Set([...alreadyAcceptedScriptIds, ...selectedScriptIds]));
  const isFullAcceptance = nextAcceptedScriptIds.length >= importedScriptIds.length;
  const reviewDetails = filterReviewDetailsByScriptIds(
    normalizedMetadata.reviewDetails as DataKeyIntegrityPublishDetails | null,
    selectedScriptIds,
  );

  return {
    selectedScriptIds,
    selectedFingerprints,
    nextAcceptedScriptIds,
    isFullAcceptance,
    reviewDetails,
  };
}
