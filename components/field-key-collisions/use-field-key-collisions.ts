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
  /**
   * A single/multi select screen keeps its options here rather than on a
   * field. Without it, duplicate option values on such a screen are reported
   * on the scripts list but show nothing on the screen itself.
   */
  items?: readonly any[] | null;
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
  /** Collisions on one of the SCREEN's own options, by its row. */
  forScreenOptionIndex: (index: number) => FieldKeyCollision[];
  /** Collisions on one option of a given field, by the field row and option row. */
  forFieldOptionIndex: (fieldIndex: number, optionIndex: number) => FieldKeyCollision[];
  blockingCount: number;
}

/**
 * Field-key collisions for one screen, computed from whatever the caller holds —
 * saved rows or unsaved form state — so a collision shows up as the second key
 * is typed rather than at publish time.
 */
export function useFieldKeyCollisions({
  fields,
  items,
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
        items: items || [],
      },
      { keys: keys || undefined },
    );

    const byIndex = new Map<number, FieldKeyCollision[]>();
    const byKey = new Map<string, FieldKeyCollision[]>();
    // Option collisions are looked up by the option's own row, which is a
    // different axis from the field row the badge above it uses.
    const byScreenOption = new Map<number, FieldKeyCollision[]>();
    const byFieldOption = new Map<string, FieldKeyCollision[]>();

    for (const collision of collisions) {
      const existing = byKey.get(collision.key) || [];
      existing.push(collision);
      byKey.set(collision.key, existing);

      for (const member of collision.members) {
        const list = byIndex.get(member.fieldIndex) || [];
        list.push(collision);
        byIndex.set(member.fieldIndex, list);

        if (!Number.isInteger(member.optionIndex)) continue;
        const optionIndex = member.optionIndex as number;

        // fieldIndex -1 marks an option on the screen itself rather than on a field.
        if (member.fieldIndex < 0) {
          const screenList = byScreenOption.get(optionIndex) || [];
          screenList.push(collision);
          byScreenOption.set(optionIndex, screenList);
        } else {
          const id = `${member.fieldIndex}:${optionIndex}`;
          const fieldList = byFieldOption.get(id) || [];
          fieldList.push(collision);
          byFieldOption.set(id, fieldList);
        }
      }
    }

    return {
      collisions,
      forFieldIndex: (index: number) => byIndex.get(index) || [],
      forKey: (key: unknown) => byKey.get(normalizeFieldKey(key)) || [],
      forScreenOptionIndex: (index: number) => byScreenOption.get(index) || [],
      forFieldOptionIndex: (fieldIndex: number, optionIndex: number) =>
        byFieldOption.get(`${fieldIndex}:${optionIndex}`) || [],
      blockingCount: collisions.filter((collision) => collision.severity === "blocking").length,
    };
  }, [fields, items, repeatable, screenId, screenTitle, keys]);
}
