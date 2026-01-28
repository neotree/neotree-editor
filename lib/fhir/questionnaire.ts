import "server-only";

import { getAppUrl, getImageUrl, isValidUrl } from "@/lib/urls";
import type { ScriptImage, ScriptField, ScriptItem } from "@/types";

const NEOTREE_EXTENSION_BASE = "https://neotree.app/fhir/StructureDefinition";

export type FhirQuestionnaire = {
    resourceType: "Questionnaire";
    id?: string;
    status: "draft" | "active" | "retired" | "unknown";
    name?: string;
    title?: string;
    description?: string;
    subjectType?: string[];
    item?: FhirQuestionnaireItem[];
};

export type FhirQuestionnaireItem = {
    linkId: string;
    text?: string;
    type: "group" | "display" | "boolean" | "decimal" | "integer" | "date" | "dateTime" | "time" | "string" | "text" | "choice" | "attachment";
    required?: boolean;
    repeats?: boolean;
    enableWhen?: FhirEnableWhen[];
    enableBehavior?: "any" | "all";
    item?: FhirQuestionnaireItem[];
    answerOption?: {
        valueString?: string;
        valueCoding?: {
            code?: string;
            display?: string;
        };
        extension?: FhirExtension[];
    }[];
    extension?: FhirExtension[];
    initial?: {
        valueString?: string;
        valueBoolean?: boolean;
        valueDecimal?: number;
        valueInteger?: number;
        valueDate?: string;
        valueDateTime?: string;
        valueTime?: string;
        valueAttachment?: FhirAttachment;
    }[];
};

export type FhirEnableWhen = {
    question: string;
    operator: "exists" | "=" | "!=" | ">" | "<" | ">=" | "<=";
    answerBoolean?: boolean;
    answerDecimal?: number;
    answerInteger?: number;
    answerDate?: string;
    answerDateTime?: string;
    answerTime?: string;
    answerString?: string;
    answerCoding?: {
        code?: string;
        display?: string;
    };
};

export type FhirExtension = {
    url: string;
    valueString?: string;
    valueBoolean?: boolean;
    valueDecimal?: number;
    valueInteger?: number;
    valueAttachment?: FhirAttachment;
};

export type FhirAttachment = {
    contentType?: string;
    data?: string;
    url?: string;
    title?: string;
};

const isDataUri = (value: string) => value.startsWith("data:");
const OPTION_EXCLUSIVE_URL = "http://hl7.org/fhir/StructureDefinition/questionnaire-optionExclusive";

const parseDataUri = (value: string) => {
    const match = value.match(/^data:([^;]+);base64,(.*)$/);
    if (!match) return null;
    return {
        contentType: match[1] || undefined,
        data: match[2] || undefined,
    };
};

const normalizeImageUrl = (value: string) => {
    if (!value) return value;
    if (isValidUrl(value)) return value;
    return getAppUrl(value);
};

const getCandidateImageUrls = (value: string) => {
    const urls = new Set<string>();
    if (!value) return [];
    if (isValidUrl(value)) {
        urls.add(value);
        return Array.from(urls);
    }

    const appUrl = getAppUrl(value);
    if (appUrl) urls.add(appUrl);

    const uploadUrl = getImageUrl(value);
    if (uploadUrl) urls.add(uploadUrl);

    return Array.from(urls);
};

async function fetchWithTimeout(url: string, timeoutMs: number) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

async function imageToAttachment(
    image: ScriptImage | string | null | undefined,
    {
        timeoutMs = 4000,
        imageMode = "base64",
    }: { timeoutMs?: number; imageMode?: "base64" | "url" } = {}
): Promise<FhirAttachment | null> {
    if (!image) return null;
    const data = typeof image === "string" ? image : image.data;
    if (!data) return null;

    if (isDataUri(data)) {
        const parsed = parseDataUri(data);
        return {
            contentType: parsed?.contentType,
            data: parsed?.data,
            title: typeof image === "string" ? undefined : image.filename,
        };
    }

    const url = normalizeImageUrl(data);
    if (!url || !isValidUrl(url)) {
        return {
            data: data,
            title: typeof image === "string" ? undefined : image.filename,
        };
    }

    if (imageMode === "url") {
        return {
            url,
            title: typeof image === "string" ? undefined : image.filename,
        };
    }

    const candidates = getCandidateImageUrls(data);
    for (const candidate of candidates) {
        try {
            const res = await fetchWithTimeout(candidate, timeoutMs);
            if (!res.ok) continue;

            const contentType = res.headers.get("content-type") || undefined;
            const buffer = Buffer.from(await res.arrayBuffer());
            const base64 = buffer.toString("base64");
            return {
                contentType,
                data: base64,
                title: typeof image === "string" ? undefined : image.filename,
            };
        } catch {
            // try next candidate
        }
    }

    return {
        url,
        title: typeof image === "string" ? undefined : image.filename,
    };
}

function buildConditionExtensions(condition?: string, skipToCondition?: string): FhirExtension[] {
    const extensions: FhirExtension[] = [];

    if (condition) {
        extensions.push({
            url: `${NEOTREE_EXTENSION_BASE}/screen-condition`,
            valueString: condition,
        });
    }

    if (skipToCondition) {
        extensions.push({
            url: `${NEOTREE_EXTENSION_BASE}/skip-to-condition`,
            valueString: skipToCondition,
        });
    }

    return extensions;
}

function isExclusiveOption(value?: string | number | null) {
    if (value === null || value === undefined) return false;
    return `${value}`.trim().toLowerCase() === "none";
}

function toAnswerOptionsFromItems(items: ScriptItem[]) {
    return items.map(item => {
        const exclusive = item.exclusive || isExclusiveOption(item.label) || isExclusiveOption(item.id) || isExclusiveOption(item.key);
        return {
            valueCoding: {
                code: item.id || item.key,
                display: item.label,
            },
            ...(exclusive
                ? {
                      extension: [
                          {
                              url: OPTION_EXCLUSIVE_URL,
                              valueBoolean: true,
                          },
                      ],
                  }
                : {}),
        };
    });
}

function toAnswerOptionsFromValues(values: string, items?: ScriptField["items"]) {
    if (items?.length) {
        return items.map(item => {
            const display = `${item.label ?? item.value ?? ""}`;
            const code = `${item.value ?? ""}`;
            const exclusive = item.exclusive || isExclusiveOption(display) || isExclusiveOption(code);
            return {
                valueCoding: {
                    code,
                    display,
                },
                ...(exclusive
                    ? {
                          extension: [
                              {
                                  url: OPTION_EXCLUSIVE_URL,
                                  valueBoolean: true,
                              },
                          ],
                      }
                    : {}),
            };
        });
    }

    const parsed = values
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => line.split(",").map(part => part.trim()))
        .map(([code, display]) => {
            const resolvedCode = code || display || "";
            const resolvedDisplay = display || code || "";
            const exclusive = isExclusiveOption(resolvedCode) || isExclusiveOption(resolvedDisplay);
            return {
                valueCoding: {
                    code: resolvedCode,
                    display: resolvedDisplay,
                },
                ...(exclusive
                    ? {
                          extension: [
                              {
                                  url: OPTION_EXCLUSIVE_URL,
                                  valueBoolean: true,
                              },
                          ],
                      }
                    : {}),
            };
        });

    return parsed;
}

type QuestionIndexEntry = {
    linkId: string;
    type: FhirQuestionnaireItem["type"];
};

function getFieldQuestionType(field: ScriptField): FhirQuestionnaireItem["type"] {
    switch (field.type) {
        case "number":
            return "decimal";
        case "date":
            return "date";
        case "time":
            return "time";
        case "datetime":
            return "dateTime";
        case "dropdown":
        case "multi_select":
            return "choice";
        case "checkbox":
        case "boolean":
            return "boolean";
        default:
            return "string";
    }
}

function getScreenQuestionType(screenType: string): FhirQuestionnaireItem["type"] | null {
    switch (screenType) {
        case "yesno":
            return "choice";
        case "single_select":
        case "multi_select":
        case "checklist":
        case "diagnosis":
            return "choice";
        default:
            return null;
    }
}

function getScreenQuestionLinkId(screenId: string, screenType: string) {
    switch (screenType) {
        case "yesno":
            return `screen-${screenId}-yesno`;
        case "single_select":
        case "multi_select":
        case "checklist":
        case "diagnosis":
            return `screen-${screenId}-options`;
        default:
            return null;
    }
}

function getFieldQuestionLinkId(screenId: string, field: ScriptField) {
    return `field-${screenId}-${field.fieldId || field.key || "field"}`;
}

function normalizeConditionExpression(expression: string) {
    return expression.replace(/\s+/g, " ").trim();
}

function splitCondition(expr: string, op: "and" | "or") {
    const parts: string[] = [];
    let current = "";
    let inSingle = false;
    let inDouble = false;
    let depth = 0;

    for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];

        if (ch === "'" && !inDouble) inSingle = !inSingle;
        if (ch === "\"" && !inSingle) inDouble = !inDouble;
        if (!inSingle && !inDouble) {
            if (ch === "(") depth++;
            if (ch === ")") depth = Math.max(0, depth - 1);
        }

        const remaining = expr.slice(i).toLowerCase();
        if (!inSingle && !inDouble && depth === 0 && remaining.startsWith(` ${op} `)) {
            parts.push(current.trim());
            current = "";
            i += op.length + 1;
            continue;
        }

        current += ch;
    }

    if (current.trim()) parts.push(current.trim());
    return parts;
}

function parseConditionClauses(condition?: string) {
    if (!condition) return null;
    const normalized = normalizeConditionExpression(condition);
    if (!normalized) return null;

    const hasOr = /\sor\s/i.test(normalized);
    const hasAnd = /\sand\s/i.test(normalized);

    let mode: "any" | "all" = hasOr ? "any" : "all";
    let op = hasOr ? "or" : hasAnd ? "and" : null;
    let parts = op ? splitCondition(normalized, op) : [normalized];
    let approximate = false;

    if (hasOr && hasAnd) {
        approximate = true;
        // Best-effort: flatten all atomic clauses and enable if any match.
        mode = "any";
        const orParts = splitCondition(normalized, "or");
        parts = orParts.flatMap(part => splitCondition(part, "and"));
    }

    const clauses = parts
        .map(part => part.replace(/^\(|\)$/g, "").trim())
        .map(part => {
            const match = part.match(/^\s*\$([A-Za-z0-9_]+)\s*(=|!=|>=|<=|>|<)\s*(.+?)\s*$/);
            if (!match) return null;
            const key = match[1];
            const operator = match[2];
            let rawValue = match[3].trim();

            if ((rawValue.startsWith("'") && rawValue.endsWith("'")) || (rawValue.startsWith("\"") && rawValue.endsWith("\""))) {
                rawValue = rawValue.slice(1, -1);
            }

            const lower = rawValue.toLowerCase();
            let value: string | number | boolean = rawValue;
            if (lower === "true") value = true;
            else if (lower === "false") value = false;
            else if (!Number.isNaN(Number(rawValue))) value = Number(rawValue);

            return { key, operator, value };
        })
        .filter((c): c is { key: string; operator: string; value: string | number | boolean } => !!c);

    if (!clauses.length) return null;
    return { mode, clauses, approximate };
}

function mapOperator(operator: string): FhirEnableWhen["operator"] {
    switch (operator) {
        case "!=":
            return "!=";
        case ">":
            return ">";
        case "<":
            return "<";
        case ">=":
            return ">=";
        case "<=":
            return "<=";
        default:
            return "=";
    }
}

function buildEnableWhen(
    condition: string | undefined,
    questionIndex: Record<string, QuestionIndexEntry>
) {
    const parsed = parseConditionClauses(condition);
    if (!parsed) return null;

    const enableWhen: FhirEnableWhen[] = [];

    for (const clause of parsed.clauses) {
        const entry = questionIndex[clause.key];
        if (!entry) return null;

        const op = mapOperator(clause.operator);
        const item: FhirEnableWhen = {
            question: entry.linkId,
            operator: op,
        };

        if (entry.type === "choice") {
            item.answerCoding = {
                code: `${clause.value}`,
                display: typeof clause.value === "string" ? clause.value : `${clause.value}`,
            };
        } else if (entry.type === "boolean") {
            item.answerBoolean = Boolean(clause.value);
        } else if (entry.type === "decimal" || entry.type === "integer") {
            const num = typeof clause.value === "number" ? clause.value : Number(clause.value);
            if (!Number.isNaN(num)) item.answerDecimal = num;
        } else if (entry.type === "date") {
            item.answerDate = `${clause.value}`;
        } else if (entry.type === "dateTime") {
            item.answerDateTime = `${clause.value}`;
        } else if (entry.type === "time") {
            item.answerTime = `${clause.value}`;
        } else {
            item.answerString = `${clause.value}`;
        }

        enableWhen.push(item);
    }

    if (!enableWhen.length) return null;
    return {
        enableWhen,
        enableBehavior: parsed.mode,
        approximate: parsed.approximate,
    };
}

function splitExclusiveAnswerOptions(options: NonNullable<FhirQuestionnaireItem["answerOption"]>) {
    const exclusive = options.find(option => {
        const extExclusive = option.extension?.some(ext => ext.url === OPTION_EXCLUSIVE_URL && ext.valueBoolean === true);
        const code = option.valueCoding?.code;
        const display = option.valueCoding?.display;
        return extExclusive || isExclusiveOption(code) || isExclusiveOption(display);
    });

    if (!exclusive) return { exclusive: null, rest: options };
    const rest = options.filter(option => option !== exclusive);
    return { exclusive, rest };
}

function addEnableWhenClause(item: FhirQuestionnaireItem, clause: FhirEnableWhen) {
    if (item.enableWhen?.length) {
        item.enableWhen = [...item.enableWhen, clause];
        item.enableBehavior = "all";
        return;
    }
    item.enableWhen = [clause];
    item.enableBehavior = "all";
}

function addConditionApproxExtension(item: FhirQuestionnaireItem) {
    const extension: FhirExtension = {
        url: `${NEOTREE_EXTENSION_BASE}/condition-approximate`,
        valueBoolean: true,
    };
    if (item.extension?.length) {
        item.extension = [...item.extension, extension];
    } else {
        item.extension = [extension];
    }
}

function applyNoneExclusivity(item: FhirQuestionnaireItem, label: string, splitNoneOption: boolean) {
    if (!splitNoneOption) return [item];
    if (!item.repeats || !item.answerOption?.length) return [item];

    const { exclusive, rest } = splitExclusiveAnswerOptions(item.answerOption);
    if (!exclusive || !rest.length) return [item];

    const noneLinkId = `${item.linkId}-none`;
    const noneItem: FhirQuestionnaireItem = {
        linkId: noneLinkId,
        text: `${label} - None`,
        type: "choice",
        answerOption: [exclusive],
    };

    const otherItem: FhirQuestionnaireItem = {
        ...item,
        answerOption: rest,
    };

    addEnableWhenClause(otherItem, {
        question: noneLinkId,
        operator: "exists",
        answerBoolean: false,
    });

    addEnableWhenClause(noneItem, {
        question: otherItem.linkId,
        operator: "exists",
        answerBoolean: false,
    });

    return [otherItem, noneItem];
}

function fieldToQuestionnaireItem(field: ScriptField, screenId: string): FhirQuestionnaireItem | null {
    const linkId = getFieldQuestionLinkId(screenId, field);
    const text = field.label || field.key || "Field";

    const base: FhirQuestionnaireItem = {
        linkId,
        text,
        type: "string",
        required: !field.optional,
    };

    const extensions = buildConditionExtensions(field.condition);
    if (extensions.length) {
        base.extension = extensions;
    }

    switch (field.type) {
        case "number":
            base.type = "decimal";
            return base;
        case "date":
            base.type = "date";
            return base;
        case "time":
            base.type = "time";
            return base;
        case "datetime":
            base.type = "dateTime";
            return base;
        case "dropdown":
            base.type = "choice";
            base.answerOption = toAnswerOptionsFromValues(field.values || "", field.items);
            return base;
        case "multi_select":
            base.type = "choice";
            base.repeats = true;
            base.answerOption = toAnswerOptionsFromValues(field.values || "", field.items);
            return base;
        case "checkbox":
        case "boolean":
            base.type = "boolean";
            return base;
        case "text":
        default:
            base.type = "string";
            return base;
    }
}

function addMinMaxExtensions(item: FhirQuestionnaireItem, field: ScriptField) {
    const minValue = field.minValue ?? field.minDate ?? field.minTime;
    const maxValue = field.maxValue ?? field.maxDate ?? field.maxTime;

    if (minValue === undefined && maxValue === undefined) return;

    const extensions: FhirExtension[] = [];

    const pushValue = (url: string, rawValue: any) => {
        if (rawValue === undefined || rawValue === null || `${rawValue}` === "") return;

        if (item.type === "date") {
            extensions.push({ url, valueString: `${rawValue}` });
            return;
        }
        if (item.type === "dateTime") {
            extensions.push({ url, valueString: `${rawValue}` });
            return;
        }
        if (item.type === "time") {
            extensions.push({ url, valueString: `${rawValue}` });
            return;
        }

        const num = Number(rawValue);
        if (!Number.isNaN(num)) {
            extensions.push({ url, valueDecimal: num });
            return;
        }

        extensions.push({ url, valueString: `${rawValue}` });
    };

    const MIN_URLS = [
        "http://hl7.org/fhir/StructureDefinition/minValue",
        "http://hl7.org/fhir/StructureDefinition/questionnaire-minValue",
    ];
    const MAX_URLS = [
        "http://hl7.org/fhir/StructureDefinition/maxValue",
        "http://hl7.org/fhir/StructureDefinition/questionnaire-maxValue",
    ];

    MIN_URLS.forEach(url => pushValue(url, minValue));
    MAX_URLS.forEach(url => pushValue(url, maxValue));

    if (!extensions.length) return;
    item.extension = item.extension ? [...item.extension, ...extensions] : extensions;
}

async function imageItemsFromScreen(
    screen: { screenId: string; image1?: ScriptImage | null; image2?: ScriptImage | null; image3?: ScriptImage | null; },
    {
        includeImages = true,
        timeoutMs = 4000,
        imageMode = "base64",
    }: { includeImages?: boolean; timeoutMs?: number; imageMode?: "base64" | "url" } = {}
) {
    if (!includeImages) return [];
    const images = [screen.image1, screen.image2, screen.image3];
    const items: FhirQuestionnaireItem[] = [];

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image) continue;
        const attachment = await imageToAttachment(image, { timeoutMs, imageMode });
        if (!attachment) continue;

        items.push({
            linkId: `screen-${screen.screenId}-image-${i + 1}`,
            text: `Image ${i + 1}`,
            type: "attachment",
            initial: [{ valueAttachment: attachment }],
        });
    }

    return items;
}

async function imageItemsFromDiagnosis(
    diagnosis: { diagnosisId: string; image1?: ScriptImage | null; image2?: ScriptImage | null; image3?: ScriptImage | null; },
    {
        includeImages = true,
        timeoutMs = 4000,
        imageMode = "base64",
    }: { includeImages?: boolean; timeoutMs?: number; imageMode?: "base64" | "url" } = {}
) {
    if (!includeImages) return [];
    const images = [diagnosis.image1, diagnosis.image2, diagnosis.image3];
    const items: FhirQuestionnaireItem[] = [];

    for (let i = 0; i < images.length; i++) {
        const image = images[i];
        if (!image) continue;
        const attachment = await imageToAttachment(image, { timeoutMs, imageMode });
        if (!attachment) continue;

        items.push({
            linkId: `diagnosis-${diagnosis.diagnosisId}-image-${i + 1}`,
            text: `Image ${i + 1}`,
            type: "attachment",
            initial: [{ valueAttachment: attachment }],
        });
    }

    return items;
}

export async function scriptToFhirQuestionnaire(
    script: {
        scriptId: string;
        title: string;
    description?: string | null;
    type?: string | null;
    screens: {
        screenId: string;
        type: string;
        title: string;
        key?: string;
        label?: string;
        condition?: string;
        skipToCondition?: string;
        positiveLabel?: string;
        negativeLabel?: string;
        items: ScriptItem[];
        fields: ScriptField[];
        drugs?: { key: string }[];
        fluids?: { key: string }[];
        feeds?: { key: string }[];
        image1?: ScriptImage | null;
        image2?: ScriptImage | null;
        image3?: ScriptImage | null;
    }[];
    diagnoses: {
        diagnosisId: string;
        name: string;
        key?: string | null;
        severityOrder?: string | number | null;
        expression?: string | number | null;
        expressionMeaning?: string | null;
        description?: string | null;
        image1?: ScriptImage | null;
        image2?: ScriptImage | null;
        image3?: ScriptImage | null;
    }[];
        drugsLibrary?: { key: string; drug?: string | null; type?: string | null; condition?: string | null }[];
    },
    options?: {
        includeImages?: boolean;
        imageFetchTimeoutMs?: number;
        imageMode?: "base64" | "url";
        splitNoneOption?: boolean;
    }
) : Promise<FhirQuestionnaire> {
    const includeImages = options?.includeImages ?? true;
    const imageFetchTimeoutMs = options?.imageFetchTimeoutMs ?? 4000;
    const imageMode = options?.imageMode ?? "base64";
    const splitNoneOption = options?.splitNoneOption ?? false;
    const questionnaire: FhirQuestionnaire = {
        resourceType: "Questionnaire",
        id: script.scriptId,
        status: "draft",
        name: script.title,
        title: script.title,
        description: script.description || undefined,
        subjectType: ["Patient"],
        item: [],
    };

    const questionIndex: Record<string, QuestionIndexEntry> = {};
    for (const screen of script.screens) {
        if (screen.key) {
            const screenQuestionType = getScreenQuestionType(screen.type);
            const screenQuestionLinkId = getScreenQuestionLinkId(screen.screenId, screen.type);
            if (screenQuestionType && screenQuestionLinkId) {
                questionIndex[screen.key] = {
                    linkId: screenQuestionLinkId,
                    type: screenQuestionType,
                };
            }
        }

        if (screen.fields?.length) {
            screen.fields.forEach(field => {
                if (!field.key) return;
                questionIndex[field.key] = {
                    linkId: getFieldQuestionLinkId(screen.screenId, field),
                    type: getFieldQuestionType(field),
                };
            });
        }
    }

    for (const screen of script.screens) {
        const groupItem: FhirQuestionnaireItem = {
            linkId: `screen-${screen.screenId}`,
            text: screen.title || screen.label || "Screen",
            type: "group",
            item: [],
        };

        const conditionExtensions = buildConditionExtensions(screen.condition, screen.skipToCondition);
        if (conditionExtensions.length) {
            groupItem.extension = conditionExtensions;
        }

        const screenEnableWhen = buildEnableWhen(screen.condition, questionIndex);
        if (screenEnableWhen) {
            groupItem.enableWhen = screenEnableWhen.enableWhen;
            groupItem.enableBehavior = screenEnableWhen.enableBehavior;
            if (screenEnableWhen.approximate) {
                addConditionApproxExtension(groupItem);
            }
        }

        const imageItems = await imageItemsFromScreen(screen, {
            includeImages,
            timeoutMs: imageFetchTimeoutMs,
            imageMode,
        });
        groupItem.item?.push(...imageItems);

        switch (screen.type) {
            case "form": {
                const items = screen.fields
                    .map(field => {
                        const item = fieldToQuestionnaireItem(field, screen.screenId);
                        if (!item) return null;
                        addMinMaxExtensions(item, field);
                        const fieldEnableWhen = buildEnableWhen(field.condition, questionIndex);
                        if (fieldEnableWhen) {
                            item.enableWhen = fieldEnableWhen.enableWhen;
                            item.enableBehavior = fieldEnableWhen.enableBehavior;
                            if (fieldEnableWhen.approximate) {
                                addConditionApproxExtension(item);
                            }
                        }
                        if (item.type === "choice" && item.repeats) {
                            return applyNoneExclusivity(item, item.text || "Selection", splitNoneOption);
                        }
                        return item;
                    })
                    .flat()
                    .filter((item): item is FhirQuestionnaireItem => !!item);
                groupItem.item?.push(...items);
                break;
            }
            case "yesno": {
                const label = screen.label || screen.title || "Yes/No";
                groupItem.item?.push({
                    linkId: `screen-${screen.screenId}-yesno`,
                    text: label,
                    type: "choice",
                    answerOption: [
                        {
                            valueCoding: {
                                code: "true",
                                display: screen.positiveLabel || "Yes",
                            },
                        },
                        {
                            valueCoding: {
                                code: "false",
                                display: screen.negativeLabel || "No",
                            },
                        },
                    ],
                });
                break;
            }
            case "single_select":
            case "multi_select":
            case "checklist":
            case "diagnosis": {
                const label = screen.label || screen.title || "Selection";
                const optionsItem: FhirQuestionnaireItem = {
                    linkId: `screen-${screen.screenId}-options`,
                    text: label,
                    type: "choice",
                    repeats: screen.type !== "single_select",
                    answerOption: toAnswerOptionsFromItems(screen.items || []),
                };

                const itemsToAdd = applyNoneExclusivity(optionsItem, label, splitNoneOption);
                groupItem.item?.push(...itemsToAdd);
                break;
            }
            case "drugs":
            case "fluids":
            case "feeds": {
                const label = screen.label || screen.title || screen.type;
                const keyMap = new Map(
                    (script.drugsLibrary || []).map(item => [item.key, item])
                );
                const rawItems = [...(screen.drugs || []), ...(screen.fluids || []), ...(screen.feeds || [])];
                const answerOption = rawItems.map(item => {
                    const libItem = keyMap.get(item.key);
                    const display = libItem?.drug || item.key;
                    const extensions: FhirExtension[] = [];
                    if (libItem?.condition) {
                        extensions.push({
                            url: `${NEOTREE_EXTENSION_BASE}/item-condition`,
                            valueString: libItem.condition,
                        });
                    }
                    return {
                        valueCoding: {
                            code: item.key,
                            display: display || item.key,
                        },
                        ...(extensions.length ? { extension: extensions } : {}),
                    };
                });

                groupItem.item?.push({
                    linkId: `screen-${screen.screenId}-meds`,
                    text: label,
                    type: "choice",
                    repeats: true,
                    answerOption,
                });
                break;
            }
            default:
                if (!groupItem.item?.length) {
                    groupItem.item?.push({
                        linkId: `screen-${screen.screenId}-display`,
                        text: screen.title || screen.label || screen.type || "Screen",
                        type: "display",
                    });
                }
                break;
        }

        questionnaire.item?.push(groupItem);
    }

    if (script.diagnoses?.length) {
        const diagnosesGroup: FhirQuestionnaireItem = {
            linkId: "diagnoses",
            text: "Diagnoses",
            type: "group",
            item: [],
        };

        for (const diagnosis of script.diagnoses) {
            const diagnosisItem: FhirQuestionnaireItem = {
                linkId: `diagnosis-${diagnosis.diagnosisId}`,
                text: diagnosis.name,
                type: "group",
                item: [],
            };

            const extensions: FhirExtension[] = [];
            if (diagnosis.expression) {
                extensions.push({
                    url: `${NEOTREE_EXTENSION_BASE}/diagnosis-expression`,
                    valueString: `${diagnosis.expression}`,
                });
            }
            if (diagnosis.expressionMeaning) {
                extensions.push({
                    url: `${NEOTREE_EXTENSION_BASE}/diagnosis-expression-meaning`,
                    valueString: diagnosis.expressionMeaning,
                });
            }
            if (diagnosis.severityOrder !== undefined && diagnosis.severityOrder !== null) {
                extensions.push({
                    url: `${NEOTREE_EXTENSION_BASE}/diagnosis-severity-order`,
                    valueString: `${diagnosis.severityOrder}`,
                });
            }
            if (diagnosis.description) {
                extensions.push({
                    url: `${NEOTREE_EXTENSION_BASE}/diagnosis-description`,
                    valueString: diagnosis.description,
                });
            }

            if (extensions.length) {
                diagnosisItem.extension = extensions;
            }

            const diagnosisEnableWhen = buildEnableWhen(`${diagnosis.expression || ""}`, questionIndex);
            if (diagnosisEnableWhen) {
                diagnosisItem.enableWhen = diagnosisEnableWhen.enableWhen;
                diagnosisItem.enableBehavior = diagnosisEnableWhen.enableBehavior;
                if (diagnosisEnableWhen.approximate) {
                    addConditionApproxExtension(diagnosisItem);
                }
            }

            if (diagnosis.description) {
                diagnosisItem.item?.push({
                    linkId: `diagnosis-${diagnosis.diagnosisId}-description`,
                    text: `Description: ${diagnosis.description}`,
                    type: "display",
                });
            }

            if (diagnosis.severityOrder !== undefined && diagnosis.severityOrder !== null && `${diagnosis.severityOrder}` !== "") {
                diagnosisItem.item?.push({
                    linkId: `diagnosis-${diagnosis.diagnosisId}-severity`,
                    text: `Severity: ${diagnosis.severityOrder}`,
                    type: "display",
                });
            }

            if (diagnosis.expressionMeaning) {
                diagnosisItem.item?.push({
                    linkId: `diagnosis-${diagnosis.diagnosisId}-meaning`,
                    text: `Meaning: ${diagnosis.expressionMeaning}`,
                    type: "display",
                });
            }

            const diagnosisImages = await imageItemsFromDiagnosis(diagnosis, {
                includeImages,
                timeoutMs: imageFetchTimeoutMs,
                imageMode,
            });
            diagnosisItem.item?.push(...diagnosisImages);

            if (!diagnosisItem.item?.length) {
                diagnosisItem.item?.push({
                    linkId: `diagnosis-${diagnosis.diagnosisId}-display`,
                    text: diagnosis.name,
                    type: "display",
                });
            }

            diagnosesGroup.item?.push(diagnosisItem);
        }

        questionnaire.item?.push(diagnosesGroup);
    }

    return questionnaire;
}
