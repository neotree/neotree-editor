export type DataKeyIntegrityRuleSeverity = "healthy" | "review" | "blocking";

export type DataKeyIntegrityRule = {
    id: string;
    label: string;
    publishLabel: string;
    severity: DataKeyIntegrityRuleSeverity;
    appliesTo: string;
    detectedWhen: string;
    whyItMatters: string;
    howToFix: string;
    match: {
        status?: string;
        kind?: string;
    };
};

export function getDataKeyIntegrityRulesHref(scriptId: string) {
    return `/script/${scriptId}/data-keys/validation-rules`;
}

// Keep scanner labels, publish blocker copy, and the public rules page backed by one catalogue.
export const DATA_KEY_INTEGRITY_RULES = [
    {
        id: "resolved",
        label: "Resolved",
        publishLabel: "resolved",
        severity: "healthy",
        appliesTo: "Linked script references",
        detectedWhen: "The script reference points to an existing data key and the stored key/label text still matches the library.",
        whyItMatters: "This reference is already managed by the data key library.",
        howToFix: "No action is needed.",
        match: { status: "resolved" },
    },
    {
        id: "out_of_sync",
        label: "Out of sync",
        publishLabel: "out of sync",
        severity: "review",
        appliesTo: "Linked script references",
        detectedWhen: "The reference is linked by unique key, but script text or option text is stale compared with the library.",
        whyItMatters: "The export still has a stable link, but users may see outdated key or label text until it is resynced.",
        howToFix: "Use Resolve or bulk resolve to refresh the script draft from the current library value.",
        match: { status: "out_of_sync" },
    },
    {
        id: "missing_data_key",
        label: "Missing data key",
        publishLabel: "missing data key",
        severity: "blocking",
        appliesTo: "References with a stored data key unique key",
        detectedWhen: "The script points to a data key unique key that no longer exists in the library.",
        whyItMatters: "Publishing would leave the script linked to a deleted or unavailable library entry.",
        howToFix: "Relink the reference to an existing same-purpose data key, or recreate the missing library key if deletion was accidental.",
        match: { status: "missing" },
    },
    {
        id: "unlinked_match",
        label: "Unlinked match",
        publishLabel: "unlinked match",
        severity: "blocking",
        appliesTo: "Legacy or imported script references",
        detectedWhen: "A matching data key exists by key/label/type, but the script reference is not linked by unique key.",
        whyItMatters: "The reference looks valid to a user but is not safely managed by the data key library.",
        howToFix: "Use Resolve or bulk resolve to save a draft that links the reference to the matching data key.",
        match: { status: "legacy_match" },
    },
    {
        id: "unmanaged_reference",
        label: "Unmanaged reference",
        publishLabel: "unmanaged reference",
        severity: "blocking",
        appliesTo: "Local, legacy, or ambiguous script references",
        detectedWhen: "The reference is not linked to the library and no safe single managed library match can be selected automatically.",
        whyItMatters: "Publishing would preserve unmanaged clinical metadata that cannot be reliably propagated when the library changes.",
        howToFix: "Open the affected usage and choose a managed data key, or create the correct data key first and then relink.",
        match: { status: "unmanaged" },
    },
    {
        id: "conflict",
        label: "Conflict",
        publishLabel: "conflict",
        severity: "review",
        appliesTo: "References with incompatible or ambiguous metadata",
        detectedWhen: "A linked or candidate data key conflicts with the expected type, or multiple candidates could match.",
        whyItMatters: "The checker cannot safely decide the intended library mapping without user review.",
        howToFix: "Open the affected usage and manually choose the correct data key or adjust the script metadata.",
        match: { status: "conflict" },
    },
    {
        id: "invalid_script_option",
        label: "Invalid script option",
        publishLabel: "invalid script option",
        severity: "blocking",
        appliesTo: "Screen and field option collections owned by a parent data key",
        detectedWhen: "A script option points to an option that no longer exists in the parent data key option pool.",
        whyItMatters: "Publishing would export selectable options that are no longer valid for the linked parent data key.",
        howToFix: "Resync the option collection from the parent data key or replace the invalid option with an allowed option.",
        match: { kind: "screen_option_collection" },
    },
    {
        id: "duplicate_parent_data_key",
        label: "Duplicate parent data key",
        publishLabel: "duplicate parent data key",
        severity: "blocking",
        appliesTo: "Parent screen and field references inside the same script",
        detectedWhen: "The same parent data key is used more than once as a parent reference in one script.",
        whyItMatters: "Duplicate parent keys create ambiguous exported data and make downstream data interpretation unsafe.",
        howToFix: "Keep one parent reference, or replace one of the duplicates with the intended distinct data key.",
        match: { kind: "duplicate_parent_data_key" },
    },
] as const satisfies readonly DataKeyIntegrityRule[];

const rulesByStatus = new Map<string, DataKeyIntegrityRule>();
const rulesByKind = new Map<string, DataKeyIntegrityRule>();

(DATA_KEY_INTEGRITY_RULES as readonly DataKeyIntegrityRule[]).forEach((rule) => {
    if (rule.match.status) rulesByStatus.set(rule.match.status, rule);
    if (rule.match.kind) rulesByKind.set(rule.match.kind, rule);
});

export function getDataKeyIntegrityRuleForEntry(entry: { status?: string; kind?: string }) {
    if (entry.kind === "field_option_collection") {
        return rulesByKind.get("screen_option_collection");
    }

    return (
        (entry.kind ? rulesByKind.get(entry.kind) : undefined) ||
        (entry.status ? rulesByStatus.get(entry.status) : undefined)
    );
}

export function isDataKeyIntegrityRuleBlocking(entry: { status?: string; kind?: string }) {
    return getDataKeyIntegrityRuleForEntry(entry)?.severity === "blocking";
}

export function getDataKeyIntegrityPublishRuleLabel(entry: { status?: string; kind?: string }) {
    return getDataKeyIntegrityRuleForEntry(entry)?.publishLabel || `${entry.status || entry.kind || "issue"}`.replaceAll("_", " ");
}
