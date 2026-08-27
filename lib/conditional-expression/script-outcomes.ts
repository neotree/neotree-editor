import type { ScriptConditionEntityRef } from "./collect";

export const OUTCOME_COLLECTIONS = {
  Diagnoses: { screenType: "diagnosis", singular: "diagnosis" },
  Problems: { screenType: "problems", singular: "problem" },
} as const;

export type OutcomeCollectionName = keyof typeof OUTCOME_COLLECTIONS;

type OutcomeScreen = {
  screenId?: string;
  type?: unknown;
  key?: unknown;
  title?: unknown;
  position?: unknown;
  fields?: { key?: unknown; label?: unknown; items?: { key?: unknown; value?: unknown; label?: unknown }[] }[];
  items?: { key?: unknown; id?: unknown; label?: unknown }[];
};

export type OutcomeKeyCollision = {
  collection: OutcomeCollectionName;
  location: string;
  entity?: ScriptConditionEntityRef;
  message: string;
};

export function isOutcomeCollectionName(value: unknown): value is OutcomeCollectionName {
  return Object.keys(OUTCOME_COLLECTIONS).includes(`${value || ""}` as OutcomeCollectionName);
}

function positionOf(screen: OutcomeScreen | undefined): number | null {
  const position = Number(screen?.position);
  return Number.isFinite(position) ? position : null;
}

export function getOutcomeProducer(
  screens: OutcomeScreen[] = [],
  collection: OutcomeCollectionName,
): OutcomeScreen | undefined {
  const type = OUTCOME_COLLECTIONS[collection].screenType;
  return [...screens]
    .filter((screen) => `${screen?.type || ""}` === type)
    .sort((a, b) => (positionOf(a) ?? Number.MAX_SAFE_INTEGER) - (positionOf(b) ?? Number.MAX_SAFE_INTEGER))[0];
}

/**
 * Returns targeted reasons why a virtual outcome collection is unavailable at
 * a given point in the script. A condition is evaluated before its screen, so
 * the producing diagnosis/problems screen must have a strictly lower position.
 */
export function getUnavailableOutcomeKeys({
  screens = [],
  consumerPosition,
}: {
  screens?: OutcomeScreen[];
  consumerPosition?: number | null;
}): Record<string, string> {
  const unavailable: Record<string, string> = {};
  const position = Number(consumerPosition);
  const hasConsumerPosition = Number.isFinite(position);

  (Object.keys(OUTCOME_COLLECTIONS) as OutcomeCollectionName[]).forEach((collection) => {
    const config = OUTCOME_COLLECTIONS[collection];
    const producer = getOutcomeProducer(screens, collection);
    if (!producer) {
      unavailable[collection] = `"$${collection}" is not available because this script has no ${config.singular} screen. Add that screen before using this collection.`;
      return;
    }

    const producerKey = `${producer?.key || ""}`.trim();
    if (producerKey.toLowerCase() !== collection.toLowerCase()) {
      unavailable[collection] = `"$${collection}" is produced by the ${config.singular} screen, but that screen currently saves to "$${producerKey || "(no key)"}". Set its key to "${collection}" first.`;
      return;
    }

    const producerPosition = positionOf(producer);
    if (!hasConsumerPosition || producerPosition === null || producerPosition >= position) {
      const producerLabel = `${producer?.title || `${config.singular} screen`}`;
      const at = producerPosition === null ? "" : ` (position ${producerPosition})`;
      unavailable[collection] = `"$${collection}" is only available after ${producerLabel}${at}. Move this condition to a later screen.`;
    }
  });

  return unavailable;
}

export function getPreScriptUnavailableOutcomeKeys(): Record<string, string> {
  return {
    Diagnoses: '"$Diagnoses" is not available here because eligibility and NUID conditions run before the script reaches its diagnosis screen.',
    Problems: '"$Problems" is not available here because eligibility and NUID conditions run before the script reaches its problems screen.',
  };
}

/** Detects real script keys that would shadow the two virtual collections. */
export function collectOutcomeKeyCollisions(script: {
  screens?: OutcomeScreen[];
  diagnoses?: { diagnosisId?: string; key?: unknown; name?: unknown; symptoms?: { key?: unknown; name?: unknown }[] }[];
  problems?: { problemId?: string; key?: unknown; name?: unknown; symptoms?: { key?: unknown; name?: unknown }[] }[];
}): OutcomeKeyCollision[] {
  const collisions: OutcomeKeyCollision[] = [];
  const screens = script?.screens || [];

  const addIfReserved = (
    rawKey: unknown,
    location: string,
    entity: ScriptConditionEntityRef | undefined,
    allowedCollection?: OutcomeCollectionName,
  ) => {
    const key = `${rawKey || ""}`.trim();
    const collection = (Object.keys(OUTCOME_COLLECTIONS) as OutcomeCollectionName[])
      .find((candidate) => candidate.toLowerCase() === key.toLowerCase());
    if (!collection || collection === allowedCollection) return;
    collisions.push({
      collection,
      location,
      entity,
      message: `The key "$${key}" conflicts with the reserved script outcome collection "$${collection}". Choose a different data key.`,
    });
  };

  screens.forEach((screen) => {
    const location = `Screen "${screen?.title || screen?.key || screen?.screenId || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "screen", screenId: screen?.screenId };
    const allowed = (Object.keys(OUTCOME_COLLECTIONS) as OutcomeCollectionName[])
      .find((collection) => OUTCOME_COLLECTIONS[collection].screenType === `${screen?.type || ""}`);
    addIfReserved(screen?.key, location, entity, allowed);
    (screen?.fields || []).forEach((field) => {
      addIfReserved(field?.key, `${location} > field "${field?.label || field?.key || ""}"`, entity);
      (field?.items || []).forEach((item) => {
        addIfReserved(item?.key || item?.value, `${location} > field "${field?.label || field?.key || ""}" > item "${item?.label || item?.key || item?.value || ""}"`, entity);
      });
    });
    (screen?.items || []).forEach((item) => {
      addIfReserved(item?.key || item?.id, `${location} > item "${item?.label || item?.key || item?.id || ""}"`, entity);
    });
  });

  (script?.diagnoses || []).forEach((diagnosis) => {
    addIfReserved(
      diagnosis?.key,
      `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`,
      { kind: "diagnosis", diagnosisId: diagnosis?.diagnosisId },
    );
    (diagnosis?.symptoms || []).forEach((symptom) => {
      addIfReserved(
        symptom?.key,
        `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}" > symptom "${symptom?.name || symptom?.key || ""}"`,
        { kind: "diagnosis", diagnosisId: diagnosis?.diagnosisId },
      );
    });
  });
  (script?.problems || []).forEach((problem) => {
    addIfReserved(
      problem?.key,
      `Problem "${problem?.name || problem?.key || ""}"`,
      { kind: "problem", problemId: problem?.problemId },
    );
    (problem?.symptoms || []).forEach((symptom) => {
      addIfReserved(
        symptom?.key,
        `Problem "${problem?.name || problem?.key || ""}" > symptom "${symptom?.name || symptom?.key || ""}"`,
        { kind: "problem", problemId: problem?.problemId },
      );
    });
  });

  return collisions;
}
