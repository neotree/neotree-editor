import type { ScriptConditionEntityRef } from "./collect";

export const OUTCOME_COLLECTIONS = {
  Diagnoses: { screenType: "diagnosis", screenLabel: "diagnosis" },
  Problems: { screenType: "problems", screenLabel: "Problems" },
} as const;

export type OutcomeCollectionName = keyof typeof OUTCOME_COLLECTIONS;

type OutcomeScreen = {
  screenId?: string;
  type?: unknown;
  key?: unknown;
  title?: unknown;
  position?: unknown;
  fields?: { fieldId?: unknown; key?: unknown; label?: unknown; items?: { itemId?: unknown; key?: unknown; value?: unknown; label?: unknown }[] }[];
  items?: { itemId?: unknown; key?: unknown; id?: unknown; label?: unknown }[];
};

export type OutcomeKeyCollision = {
  collection: OutcomeCollectionName;
  /** Stable entity/path identity used to grandfather an unchanged legacy key. */
  identity: string;
  location: string;
  entity?: ScriptConditionEntityRef;
  message: string;
};

export function isOutcomeCollectionName(value: unknown): value is OutcomeCollectionName {
  return Object.keys(OUTCOME_COLLECTIONS).includes(`${value || ""}` as OutcomeCollectionName);
}

/**
 * Diagnosis and Problems screens expose virtual, script-scoped collections.
 * The editor derives their CE identity from the screen type rather than a
 * global data key, which keeps legacy screens with an empty stored key usable
 * without a database backfill.
 *
 * This mapping is editor-side only. Do not use it to rewrite script metadata
 * exports: those payloads are an existing mobile-app contract and must retain
 * their stored keys and datatypes.
 */
export function getOutcomeCollectionForScreenType(type: unknown): OutcomeCollectionName | undefined {
  return (Object.keys(OUTCOME_COLLECTIONS) as OutcomeCollectionName[])
    .find((collection) => OUTCOME_COLLECTIONS[collection].screenType === `${type || ""}`);
}

function positionOf(screen: OutcomeScreen | undefined): number | null {
  if (screen?.position === null || screen?.position === undefined || screen?.position === "") return null;
  const position = Number(screen?.position);
  return Number.isFinite(position) ? position : null;
}

export function getOutcomeProducer(
  screens: OutcomeScreen[] = [],
  collection: OutcomeCollectionName,
): OutcomeScreen | undefined {
  return [...screens]
    .filter((screen) => getOutcomeCollectionForScreenType(screen?.type) === collection)
    .sort((a, b) => (positionOf(a) ?? Number.MAX_SAFE_INTEGER) - (positionOf(b) ?? Number.MAX_SAFE_INTEGER))[0];
}

export type OutcomeProducers = Partial<Record<OutcomeCollectionName, OutcomeScreen>>;

/** Computes both virtual collection producers once for repeated availability checks. */
export function getOutcomeProducers(screens: OutcomeScreen[] = []): OutcomeProducers {
  return (Object.keys(OUTCOME_COLLECTIONS) as OutcomeCollectionName[]).reduce<OutcomeProducers>(
    (producers, collection) => {
      const producer = getOutcomeProducer(screens, collection);
      if (producer) producers[collection] = producer;
      return producers;
    },
    {},
  );
}

/**
 * Returns targeted reasons why a virtual outcome collection is unavailable at
 * a given point in the script. A condition is evaluated before its screen, so
 * the producing diagnosis/problems screen must have a strictly lower position.
 */
export function getUnavailableOutcomeKeys({
  screens = [],
  consumerPosition,
  producers,
}: {
  screens?: OutcomeScreen[];
  consumerPosition?: number | null;
  producers?: OutcomeProducers;
}): Record<string, string> {
  const unavailable: Record<string, string> = {};
  const position = consumerPosition === null || consumerPosition === undefined
    ? Number.NaN
    : Number(consumerPosition);
  const hasConsumerPosition = Number.isFinite(position);
  // When the consuming runtime point is unknown (missing producer, imported
  // null position, or still-loading form data), ordering cannot be established.
  // Do not manufacture a blocking "move later" error from that uncertainty.
  if (!hasConsumerPosition) return unavailable;

  (Object.keys(OUTCOME_COLLECTIONS) as OutcomeCollectionName[]).forEach((collection) => {
    const config = OUTCOME_COLLECTIONS[collection];
    const producer = producers ? producers[collection] : getOutcomeProducer(screens, collection);
    if (!producer) {
      unavailable[collection] = `"$${collection}" is not available because this script has no ${config.screenLabel} screen. Add that screen before using this collection.`;
      return;
    }

    const producerPosition = positionOf(producer);
    // Imported producer screens can also lack a reliable position. In that
    // case the ordering is unknown, so availability remains non-blocking.
    if (producerPosition === null) return;
    if (producerPosition >= position) {
      const producerLabel = `${producer?.title || `${config.screenLabel} screen`}`;
      unavailable[collection] = `"$${collection}" is only available after ${producerLabel} (position ${producerPosition}). Move this condition to a later screen.`;
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
    identity: string,
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
      identity,
      location,
      entity,
      message: `The key "$${key}" conflicts with the reserved script outcome collection "$${collection}". Choose a different data key.`,
    });
  };

  screens.forEach((screen, screenIndex) => {
    const screenIdentity = `screen:${screen?.screenId || screenIndex}`;
    const location = `Screen "${screen?.title || screen?.key || screen?.screenId || ""}"`;
    const entity: ScriptConditionEntityRef = { kind: "screen", screenId: screen?.screenId };
    const allowed = getOutcomeCollectionForScreenType(screen?.type);
    // Outcome-screen parent keys are legacy storage only. Runtime collection
    // identity is derived from the type, so the stored parent key is neither a
    // collision nor a data-key reference.
    if (!allowed) addIfReserved(screen?.key, `${screenIdentity}:key`, location, entity);
    (screen?.fields || []).forEach((field, fieldIndex) => {
      const fieldIdentity = `${screenIdentity}:field:${field?.fieldId || fieldIndex}`;
      addIfReserved(field?.key, `${fieldIdentity}:key`, `${location} > field "${field?.label || field?.key || ""}"`, entity);
      (field?.items || []).forEach((item, itemIndex) => {
        addIfReserved(item?.key || item?.value, `${fieldIdentity}:item:${item?.itemId || itemIndex}:key`, `${location} > field "${field?.label || field?.key || ""}" > item "${item?.label || item?.key || item?.value || ""}"`, entity);
      });
    });
    (screen?.items || []).forEach((item, itemIndex) => {
      addIfReserved(item?.key || item?.id, `${screenIdentity}:item:${item?.itemId || itemIndex}:key`, `${location} > item "${item?.label || item?.key || item?.id || ""}"`, entity);
    });
  });

  (script?.diagnoses || []).forEach((diagnosis, diagnosisIndex) => {
    const diagnosisIdentity = `diagnosis:${diagnosis?.diagnosisId || diagnosisIndex}`;
    addIfReserved(
      diagnosis?.key,
      `${diagnosisIdentity}:key`,
      `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`,
      { kind: "diagnosis", diagnosisId: diagnosis?.diagnosisId },
    );
    (diagnosis?.symptoms || []).forEach((symptom, symptomIndex) => {
      addIfReserved(
        symptom?.key,
        `${diagnosisIdentity}:symptom:${(symptom as any)?.symptomId || symptomIndex}:key`,
        `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}" > symptom "${symptom?.name || symptom?.key || ""}"`,
        { kind: "diagnosis", diagnosisId: diagnosis?.diagnosisId },
      );
    });
  });
  (script?.problems || []).forEach((problem, problemIndex) => {
    const problemIdentity = `problem:${problem?.problemId || problemIndex}`;
    addIfReserved(
      problem?.key,
      `${problemIdentity}:key`,
      `Problem "${problem?.name || problem?.key || ""}"`,
      { kind: "problem", problemId: problem?.problemId },
    );
    (problem?.symptoms || []).forEach((symptom, symptomIndex) => {
      addIfReserved(
        symptom?.key,
        `${problemIdentity}:symptom:${(symptom as any)?.symptomId || symptomIndex}:key`,
        `Problem "${problem?.name || problem?.key || ""}" > symptom "${symptom?.name || symptom?.key || ""}"`,
        { kind: "problem", problemId: problem?.problemId },
      );
    });
  });

  return collisions;
}

/**
 * Blocks newly introduced reserved-key collisions while allowing a legacy
 * collision at the same stable entity/path to be saved unchanged. This keeps
 * unrelated edits possible without silently permitting a new ambiguity.
 */
export function collectNewOutcomeKeyCollisions(
  incoming: Parameters<typeof collectOutcomeKeyCollisions>[0],
  current?: Parameters<typeof collectOutcomeKeyCollisions>[0],
): OutcomeKeyCollision[] {
  const existing = new Set(
    collectOutcomeKeyCollisions(current || {}).map((collision) => `${collision.collection}:${collision.identity}`),
  );
  return collectOutcomeKeyCollisions(incoming)
    .filter((collision) => !existing.has(`${collision.collection}:${collision.identity}`));
}
