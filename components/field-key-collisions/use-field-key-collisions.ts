"use client";

import { useMemo } from "react";

import type { ConditionKey } from "@/lib/conditional-expression";
import {
  findScreenFieldKeyCollisions,
  normalizeFieldKey,
  type CollisionField,
  type FieldKeyCollision,
} from "@/lib/field-key-collisions";

export interface UseFieldKeyCollisionsParams {
  fields: CollisionField[] | null | undefined;
  repeatable?: boolean | null;
  screenId?: string | null;
  screenTitle?: string | null;
  keys?: ConditionKey[] | null;
}

export interface UseFieldKeyCollisionsResult {
  collisions: FieldKeyCollision[];
  /** Collisions that include a given field index — for a per-row badge. */
  forFieldIndex: (index: number) => FieldKeyCollision[];
  /** Collisions on a key — for the field editor, which knows the key not the row. */
  forKey: (key: unknown) => FieldKeyCollision[];
  blockingCount: number;
}

/**
 * Field-key collisions for one screen, computed from whatever the caller holds —
 * saved rows or unsaved form state — so a collision shows up as the second key
 * is typed rather than at publish time.
 */
export function useFieldKeyCollisions({
  fields,
  repeatable,
  screenId,
  screenTitle,
  keys,
}: UseFieldKeyCollisionsParams): UseFieldKeyCollisionsResult {
  return useMemo(() => {
    const collisions = findScreenFieldKeyCollisions(
      {
        screenId: screenId || undefined,
        title: screenTitle || undefined,
        repeatable: !!repeatable,
        fields: fields || [],
      },
      { keys: keys || undefined },
    );

    const byIndex = new Map<number, FieldKeyCollision[]>();
    const byKey = new Map<string, FieldKeyCollision[]>();
    for (const collision of collisions) {
      const existing = byKey.get(collision.key) || [];
      existing.push(collision);
      byKey.set(collision.key, existing);

      for (const member of collision.members) {
        const list = byIndex.get(member.fieldIndex) || [];
        list.push(collision);
        byIndex.set(member.fieldIndex, list);
      }
    }

    return {
      collisions,
      forFieldIndex: (index: number) => byIndex.get(index) || [],
      forKey: (key: unknown) => byKey.get(normalizeFieldKey(key)) || [],
      blockingCount: collisions.filter((collision) => collision.severity === "blocking").length,
    };
  }, [fields, repeatable, screenId, screenTitle, keys]);
}
