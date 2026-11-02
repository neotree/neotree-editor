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
import { normalizeDataKeyCompatibilityType } from "@/lib/data-key-types";

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

    if (!f?.keyId) {
      errors.push(key
        ? `"${key}" is not linked to a Data Key library key. Link it, or create it in the library.`
        : "Choose a Data Key library key.");
    } else if (opts?.getLibraryKey) {
      const libraryKey = opts.getLibraryKey(`${f.keyId}`);
      if (!libraryKey) {
        errors.push(`The data key for "${key || "this field"}" no longer exists in the library. Link another key.`);
      } else if (normalizeDataKeyCompatibilityType(libraryKey.dataType) !== normalizeDataKeyCompatibilityType(type)) {
        errors.push(`"${libraryKey.name}" is a ${libraryKey.dataType || "untyped"} key, but this field needs a ${type || "typed"} key.`);
      } else if ((type === "dropdown") && !libraryKey.options?.length) {
        errors.push(`"${libraryKey.name}" has no options. Add them in the Data Key library.`);
      } else {
        // Nothing the library owns may differ from it by the time it reaches the app.
        const expected = applyLibraryKeyToNuidField(f, libraryKey, opts.getLibraryKey);
        const stale: string[] = (["key", "label", "values"] as const).filter((p) => `${expected[p] ?? ""}` !== `${f[p] ?? ""}`);
        if (!!expected.confidential !== !!f.confidential || !!expected.confidentialLabelOnly !== !!f.confidentialLabelOnly) stale.push("confidentiality");
        if (stale.length) {
          errors.push(`"${key}" is out of date with the Data Key library (${stale.join(", ")}). Open the script's NUID Search page and save it to refresh.`);
        }
      }
    }

    if (key && (keyCounts.get(key.toLowerCase()) || 0) > 1) errors.push(`"${key}" is used by more than one field.`);
    if (f?.keyId && !`${f?.label || ""}`.trim()) errors.push(`"${key}" has no label. Add one in the Data Key library.`);

    if (type === "dropdown") {
      if (f?.keyId && !parseNuidOptions(f.values).length) errors.push(`"${key}" has no options. Add them in the Data Key library.`);
    } else if (type === "text") {
      if (f?.searchRole && !isNuidSearchRole(f.searchRole)) {
        errors.push(`Unknown search role "${f.searchRole}".`);
      } else if (f?.searchRole) {
        // Released apps ignore the role and go by key and label, so the two must agree.
        const compatible = getCompatibleNuidSearchRoles(f);
        if (!compatible.includes(f.searchRole as NuidSearchRole)) {
          errors.push(
            `Search role "${getNuidSearchRoleLabel(f.searchRole as NuidSearchRole)}" doesn't match what released app versions do with "${key}": `
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
      const name = `${fields[i]?.label || fields[i]?.key || `field ${i + 1}`}`.trim();
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
 * The field as its library key says it is: everything the key owns (name,
 * label, options, confidentiality) comes from the library; what the page owns
 * (condition, required, role) is left alone. `getKey` resolves the key's option
 * children by id.
 */
export function applyLibraryKeyToNuidField<T extends NuidSearchFieldLike>(
  field: T,
  libraryKey: NuidLibraryKeyFull,
  getKey: (id: string) => NuidLibraryKeyFull | null | undefined,
): T {
  const next: T = {
    ...field,
    keyId: libraryKey.uniqueKey || field.keyId,
    key: `${libraryKey.name || ""}`,
    label: `${libraryKey.label || libraryKey.name || ""}`,
    confidential: !!libraryKey.confidential,
    confidentialLabelOnly: !!libraryKey.confidentialLabelOnly,
  };

  if (field.type === "dropdown") {
    const options = (libraryKey.options || [])
      .map((id) => getKey(`${id}`))
      .filter((c): c is NuidLibraryKeyFull => !!c?.name)
      .map((c) => ({ value: `${c.name}`, label: `${c.label || c.name}` }));
    next.values = formatNuidOptions(options);
  }

  return next;
}
