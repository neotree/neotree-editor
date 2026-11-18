/**
 * NUID Search fields: what the editor and the publish gate check, from one place.
 * Pure and dependency-free apart from type normalisation, so the editor UI and
 * the server validate a field the same way.
 *
 * Every field is a Data Key library key. The key, label, options and
 * confidentiality are the library's and are edited there; the NUID Search page
 * only decides how it uses the key — its condition, whether it is required, and
 * for a search, its role.
 */
import { normalizeDataKeyType } from "@/lib/data-key-types";

/**
 * What a "Neotree ID search" field does on the app. Set explicitly so the app
 * no longer has to guess from the key or label (see inferNuidSearchRole).
 */
export type NuidSearchRole = "patient" | "transfer" | "twin" | "lookup";

export const NUID_SEARCH_ROLES: { value: NuidSearchRole; label: string; description: string }[] = [
  {
    value: "patient",
    label: "Patient",
    description: "Finds this baby's record. Its Neotree ID is used for the session, an existing session can be continued, and the BID/StillBirth start is offered.",
  },
  {
    value: "transfer",
    label: "Transfer",
    description: "Finds this baby's record from another facility. Its Neotree ID is used for the session.",
  },
  {
    value: "twin",
    label: "Twin",
    description: "Finds the twin's record to pre-populate from. The baby still gets its own Neotree ID.",
  },
  {
    value: "lookup",
    label: "Lookup only",
    description: "Finds a record to pre-populate from. Its Neotree ID is not used for the session.",
  },
];

export const NUID_FIELD_TYPE_LABELS: Record<string, string> = {
  dropdown: "Choice",
  text: "Neotree ID search",
};

/** The two field types the mobile app renders on its NUID Search page. */
export type NuidFieldType = "dropdown" | "text";

/**
 * The NUID Search field type a library key gives, or null when the mobile app can't show
 * that kind of key there. The app renders `type === "dropdown"` as a single choice from the
 * key's options and anything else as a Neotree ID search, so only these are offered:
 * dropdown / single select keys (they always have options) become a Choice, text keys a
 * Neotree ID search. Everything else (multi select, yes/no, number, date…) would surprise.
 */
export function getNuidFieldTypeForDataKey(dataKey?: { dataType?: string | null } | null): NuidFieldType | null {
  const type = normalizeDataKeyType(dataKey?.dataType);
  if (type === "single_select") return "dropdown";
  if (type === "text") return "text";
  return null;
}

/** Whether a library key can be used on the NUID Search page. */
export function isNuidSupportedDataKey(dataKey?: { dataType?: string | null } | null) {
  return !!getNuidFieldTypeForDataKey(dataKey);
}

/** Said wherever an unsupported key needs explaining. */
export const NUID_SUPPORTED_KEYS_DESCRIPTION =
  "NUID Search uses dropdown or single select keys (shown as a choice) and text keys (shown as a Neotree ID search).";

export type NuidSearchFieldLike = {
  key?: string | null;
  keyId?: string | null;
  label?: string | null;
  type?: string | null;
  values?: string | null;
  searchRole?: string | null;
  confidential?: boolean | null;
  confidentialLabelOnly?: boolean | null;
};

export type NuidLibraryKeyLike = {
  name?: string | null;
  label?: string | null;
  dataType?: string | null;
  /** Child keys, for a dropdown. */
  options?: string[] | null;
};

export type NuidFieldReport = {
  /** Block publishing until fixed. */
  errors: string[];
  /** Never block anything. */
  warnings: string[];
};

export function isNuidSearchRole(value: unknown): value is NuidSearchRole {
  return NUID_SEARCH_ROLES.some((r) => r.value === value);
}

/** What a search field does on the app (see the app's src/utils/nuid-search-role.ts). */
export type NuidSearchBehaviour = {
  isPrimarySearch: boolean;
  isTwinSearch: boolean;
  suppliesSessionUid: boolean;
  isPreferredPatientId: boolean;
};

const ROLE_BEHAVIOUR: Record<NuidSearchRole, NuidSearchBehaviour> = {
  patient: { isPrimarySearch: true, isTwinSearch: false, suppliesSessionUid: true, isPreferredPatientId: true },
  transfer: { isPrimarySearch: false, isTwinSearch: false, suppliesSessionUid: true, isPreferredPatientId: true },
  twin: { isPrimarySearch: false, isTwinSearch: true, suppliesSessionUid: false, isPreferredPatientId: false },
  lookup: { isPrimarySearch: false, isTwinSearch: false, suppliesSessionUid: false, isPreferredPatientId: false },
};

/**
 * What app versions without search roles do with a field, from its key and label.
 * A verbatim copy of the app's legacy rules (getLegacyBehaviour in the app's
 * src/utils/nuid-search-role.ts): change neither without the other.
 */
export function getLegacyNuidSearchBehaviour(field: NuidSearchFieldLike): NuidSearchBehaviour {
  const key = `${field?.key ?? ""}`.toLowerCase();
  const label = `${field?.label ?? ""}`.toLowerCase();
  const isTwinSearch = field?.key === "BabyTwinNUID";

  return {
    isPrimarySearch: field?.type === "text"
      && !key.includes("twin")
      && !label.includes("twin")
      && !key.includes("transfer")
      && !label.includes("transfer"),
    isTwinSearch,
    suppliesSessionUid: !isTwinSearch,
    isPreferredPatientId: field?.key === "patientNUID" || field?.key === "BabyTransferedNUID",
  };
}

const sameBehaviour = (a: NuidSearchBehaviour, b: NuidSearchBehaviour) => (
  a.isPrimarySearch === b.isPrimarySearch
  && a.isTwinSearch === b.isTwinSearch
  && a.suppliesSessionUid === b.suppliesSessionUid
  && a.isPreferredPatientId === b.isPreferredPatientId
);

/**
 * The roles a field may have without changing what app versions released before
 * search roles do with it: a role must mean exactly what its key and label
 * already mean to them. Empty when no role matches; such a field keeps no role.
 */
export function getCompatibleNuidSearchRoles(field: NuidSearchFieldLike): NuidSearchRole[] {
  const legacy = getLegacyNuidSearchBehaviour(field);
  return NUID_SEARCH_ROLES.map((r) => r.value).filter((role) => sameBehaviour(ROLE_BEHAVIOUR[role], legacy));
}

/** How app versions without search roles describe a field, in role terms when one fits. */
export function describeLegacyNuidSearchBehaviour(field: NuidSearchFieldLike): string {
  const [role] = getCompatibleNuidSearchRoles(field);
  if (role) return getNuidSearchRoleLabel(role);
  const b = getLegacyNuidSearchBehaviour(field);
  if (b.isTwinSearch) return "a twin search";
  return b.suppliesSessionUid ? "a search whose Neotree ID is used for the session" : "a lookup";
}

/**
 * The role the app gives a search field that has none set: the matching role
 * when there is one, otherwise the closest.
 */
export function inferNuidSearchRole(field: NuidSearchFieldLike): NuidSearchRole {
  const [role] = getCompatibleNuidSearchRoles(field);
  if (role) return role;
  const b = getLegacyNuidSearchBehaviour(field);
  if (b.isTwinSearch) return "twin";
  return b.suppliesSessionUid ? "transfer" : "lookup";
}

export function getNuidSearchRole(field: NuidSearchFieldLike): { role: NuidSearchRole; inferred: boolean } {
  if (isNuidSearchRole(field?.searchRole)) return { role: field.searchRole, inferred: false };
  return { role: inferNuidSearchRole(field), inferred: true };
}

export function getNuidSearchRoleLabel(role: NuidSearchRole) {
  return NUID_SEARCH_ROLES.find((r) => r.value === role)?.label || role;
}

/** `value,label` per line, the format the app parses. The label may contain commas. */
export function parseNuidOptions(values?: string | null): { value: string; label: string }[] {
  return `${values || ""}`
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, ...rest] = line.split(",");
      return { value: `${value || ""}`.trim(), label: rest.join(",").trim() };
    });
}

export function formatNuidOptions(options: { value: string; label: string }[]) {
  return options.map((o) => `${o.value},${o.label}`).join("\n");
}

/**
 * The NUID Search fields that are live: none while NUID Search is switched off (the fields are
 * kept for when it is switched back on, but devices don't get them, so their keys must not
 * count as script keys for conditions either).
 */
export function getActiveNuidSearchFields<T = NuidSearchFieldLike>(
  script?: { nuidSearchEnabled?: boolean | null; nuidSearchFields?: T[] | null } | null,
): T[] {
  return script?.nuidSearchEnabled ? (script.nuidSearchFields || []) : [];
}

/** "Does the baby have a twin?" (BabyTwin): the label the app shows, then the key conditions use. */
export function describeNuidField(
  f?: { key?: string | null; label?: string | null } | null,
  libraryKey?: { name?: string | null; label?: string | null } | null,
) {
  const key = `${libraryKey?.name || f?.key || ""}`.trim();
  const label = `${libraryKey?.label || f?.label || ""}`.trim();
  if (label && key && label !== key) return `"${label}" (${key})`;
  return `"${label || key || "This field"}"`;
}

/**
 * Checks each field. Without `getLibraryKey` only what the field itself shows is
 * checked; with it, the linked key is checked against the library too.
 */
export function validateNuidSearchFields(
  fields: NuidSearchFieldLike[] | null | undefined,
  opts?: { getLibraryKey?: (keyId: string) => NuidLibraryKeyFull | null | undefined },
): NuidFieldReport[] {
  const list = fields || [];

  // Conditions are compared lowercased on the app, so `Twin` and `twin` collide.
  const keyCounts = new Map<string, number>();
  for (const f of list) {
    const k = `${f?.key || ""}`.trim().toLowerCase();
    if (k) keyCounts.set(k, (keyCounts.get(k) || 0) + 1);
  }

  return list.map((f) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const key = `${f?.key || ""}`.trim();
    const type = `${f?.type || ""}`.trim();
    const libraryKey = f?.keyId && opts?.getLibraryKey ? opts.getLibraryKey(`${f.keyId}`) : undefined;
    // Named by label and key everywhere ("Does the baby have a twin?" (BabyTwin)).
    const who = describeNuidField(f, libraryKey);

    if (!f?.keyId) {
      errors.push(key
        ? `${who} is not linked to a Data Key library key. Link it, or create it in the library.`
        : "Choose a Data Key library key.");
    } else if (opts?.getLibraryKey) {
      if (!libraryKey) {
        errors.push(`${who} is linked to a data key that isn't in this library (for example, one from another editor that came in with an import). Link the field to a key from this library.`);
      } else if (!getNuidFieldTypeForDataKey(libraryKey)) {
        errors.push(`${who} is linked to a ${libraryKey.dataType || "untyped"} key, which the mobile app can't show on the NUID Search page. ${NUID_SUPPORTED_KEYS_DESCRIPTION} Link another key.`);
      } else if ((getNuidFieldTypeForDataKey(libraryKey) === "dropdown") && !libraryKey.options?.length) {
        errors.push(`${who} has no options. Add them in the Data Key library.`);
      } else {
        // Nothing the library owns may differ from it by the time it reaches the app.
        const expected = applyLibraryKeyToNuidField(f, libraryKey, opts.getLibraryKey);
        const stale: string[] = (["key", "label", "type", "values"] as const).filter((p) => `${expected[p] ?? ""}` !== `${f[p] ?? ""}`);
        if (!!expected.confidential !== !!f.confidential || !!expected.confidentialLabelOnly !== !!f.confidentialLabelOnly) stale.push("confidentiality");
        if (stale.length) {
          errors.push(`${who} is out of date with the Data Key library (${stale.join(", ")}). Use "Update from library" on the script's NUID Search page.`);
        }
      }
    }

    if (key && (keyCounts.get(key.toLowerCase()) || 0) > 1) errors.push(`${who} is used by more than one field.`);
    if (f?.keyId && !`${f?.label || ""}`.trim()) errors.push(`${who} has no label, so the app shows the question without one. Add a label in the Data Key library.`);

    if (type === "dropdown") {
      if (f?.keyId && !parseNuidOptions(f.values).length) errors.push(`${who} has no options. Add them in the Data Key library.`);
    } else if (type === "text") {
      if (f?.searchRole && !isNuidSearchRole(f.searchRole)) {
        errors.push(`Unknown search role "${f.searchRole}".`);
      } else if (f?.searchRole) {
        // Released apps ignore the role and go by key and label, so the two must agree.
        const compatible = getCompatibleNuidSearchRoles(f);
        if (!compatible.includes(f.searchRole as NuidSearchRole)) {
          errors.push(
            `Search role "${getNuidSearchRoleLabel(f.searchRole as NuidSearchRole)}" doesn't match what released app versions do with ${who}: `
            + `they treat it as ${describeLegacyNuidSearchBehaviour(f)}. `
            + (compatible.length
              ? `Choose ${compatible.map((r) => `"${getNuidSearchRoleLabel(r)}"`).join(" or ")}, or link a key that matches the role.`
              : "Leave the role unset, or link a key that matches the role."),
          );
        }
      } else if (getCompatibleNuidSearchRoles(f).length) {
        warnings.push(`No search role set. The app will treat it as "${getNuidSearchRoleLabel(inferNuidSearchRole(f))}".`);
      }
    } else {
      errors.push(`Unsupported field type "${type || "none"}".`);
    }

    return { errors, warnings };
  });
}

/**
 * The NUID Search errors that stop a publish, one line per field problem, for
 * the scripts about to be published. Only scripts with NUID Search turned on
 * are checked: the app ignores the fields otherwise.
 */
export function collectNuidSearchPublishErrors(
  scripts: { title?: string | null; nuidSearchEnabled?: boolean | null; nuidSearchFields?: NuidSearchFieldLike[] | null }[],
  opts?: { getLibraryKey?: (keyId: string) => NuidLibraryKeyFull | null | undefined },
): string[] {
  const lines: string[] = [];
  for (const script of scripts || []) {
    if (!script?.nuidSearchEnabled) continue;
    const fields = script.nuidSearchFields || [];
    validateNuidSearchFields(fields, opts).forEach((report, i) => {
      const name = `${fields[i]?.label || fields[i]?.key || `field ${i + 1}`}`.trim()
        + (fields[i]?.label && fields[i]?.key && fields[i]?.label !== fields[i]?.key ? ` (${fields[i]?.key})` : "");
      report.errors.forEach((error) => lines.push(`${script.title || "Untitled script"}: ${name}: ${error}`));
    });
  }
  return lines;
}

export type NuidLibraryKeyFull = NuidLibraryKeyLike & {
  uniqueKey?: string | null;
  uuid?: string | null;
  confidential?: boolean | null;
  confidentialLabelOnly?: boolean | null;
};

/**
 * The field as its library key says it is: everything the key owns (name, label,
 * field type, options, confidentiality) comes from the library; what the page owns
 * (condition, required, role) is left alone. `getKey` resolves the key's option
 * children by id.
 */
export function applyLibraryKeyToNuidField<T extends NuidSearchFieldLike>(
  field: T,
  libraryKey: NuidLibraryKeyFull,
  getKey: (id: string) => NuidLibraryKeyFull | null | undefined,
): T {
  // The type is the key's too: a choice for dropdown keys, a search for text keys.
  const type = getNuidFieldTypeForDataKey(libraryKey) || field.type;
  const next: T = {
    ...field,
    type,
    keyId: libraryKey.uniqueKey || field.keyId,
    key: `${libraryKey.name || ""}`,
    label: `${libraryKey.label || libraryKey.name || ""}`,
    confidential: !!libraryKey.confidential,
    confidentialLabelOnly: !!libraryKey.confidentialLabelOnly,
  };

  if (type !== field.type) {
    // A choice has no search role; a search has no options.
    if (type !== "text") delete (next as NuidSearchFieldLike).searchRole;
    if (type !== "dropdown") delete (next as NuidSearchFieldLike).values;
  }

  if (type === "dropdown") {
    const options = (libraryKey.options || [])
      .map((id) => getKey(`${id}`))
      .filter((c): c is NuidLibraryKeyFull => !!c?.name)
      .map((c) => ({ value: `${c.name}`, label: `${c.label || c.name}` }));
    next.values = formatNuidOptions(options);
  }

  return next;
}
