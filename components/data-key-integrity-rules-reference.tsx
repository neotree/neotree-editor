import {
    DATA_KEY_INTEGRITY_RULES,
    type DataKeyIntegrityRule,
} from "@/lib/data-key-integrity-rules";
import { INTEGRITY_BASELINE_RULESET_VERSION } from "@/lib/integrity-policy";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const severityMeta: Record<DataKeyIntegrityRule["severity"], {
    label: string;
    summaryLabel: string;
    className: string;
}> = {
    blocking: {
        label: "Blocks publish",
        summaryLabel: "Blocking rules",
        className: "border-red-200 bg-red-50 text-red-700",
    },
    review: {
        label: "Needs review",
        summaryLabel: "Review states",
        className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    healthy: {
        label: "Healthy state",
        summaryLabel: "Healthy state",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
};

function IntegrityRuleBadge({ severity }: { severity: DataKeyIntegrityRule["severity"] }) {
    return (
        <span className={cn("inline-flex rounded px-2 py-1 text-xs font-medium", severityMeta[severity].className)}>
            {severityMeta[severity].label}
        </span>
    );
}

function IntegrityRuleCard({ rule }: { rule: DataKeyIntegrityRule }) {
    return (
        <div className="rounded-md border p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <div className="font-medium">{rule.label}</div>
                    <div className="text-sm text-muted-foreground">{rule.appliesTo}</div>
                </div>
                <IntegrityRuleBadge severity={rule.severity} />
            </div>

            <div className="mt-4 grid gap-4 text-sm lg:grid-cols-3">
                <div>
                    <div className="font-medium">When it appears</div>
                    <div className="mt-1 text-muted-foreground">{rule.detectedWhen}</div>
                </div>
                <div>
                    <div className="font-medium">Why it matters</div>
                    <div className="mt-1 text-muted-foreground">{rule.whyItMatters}</div>
                </div>
                <div>
                    <div className="font-medium">How to fix</div>
                    <div className="mt-1 text-muted-foreground">{rule.howToFix}</div>
                </div>
            </div>
        </div>
    );
}

function IntegrityRuleSection({
    title,
    description,
    rules,
}: {
    title: string;
    description: string;
    rules: readonly DataKeyIntegrityRule[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {rules.map((rule) => (
                    <IntegrityRuleCard key={rule.id} rule={rule} />
                ))}
            </CardContent>
        </Card>
    );
}

function RuleSummaryTile({
    label,
    value,
    description,
}: {
    label: string;
    value: string | number;
    description: string;
}) {
    return (
        <div className="rounded-md border p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>
    );
}

const blockingIntegrityRules = DATA_KEY_INTEGRITY_RULES.filter((rule) => rule.severity === "blocking");
const reviewIntegrityRules = DATA_KEY_INTEGRITY_RULES.filter((rule) => rule.severity === "review");
const healthyIntegrityRules = DATA_KEY_INTEGRITY_RULES.filter((rule) => rule.severity === "healthy");

export function DataKeyIntegrityRulesReference({ scriptTitle }: { scriptTitle?: string }) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">How validation works</CardTitle>
                    <CardDescription>
                        Read-only reference for the data key integrity rules used by the registry, publish blocker, and repair flows.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <RuleSummaryTile
                            label="Current script"
                            value={scriptTitle || "Selected script"}
                            description="Rules are global, but this page is opened from the current script context."
                        />
                        <RuleSummaryTile
                            label="Rule set"
                            value={INTEGRITY_BASELINE_RULESET_VERSION}
                            description="Used when deciding whether an existing baseline is compatible."
                        />
                        <RuleSummaryTile
                            label={severityMeta.blocking.summaryLabel}
                            value={blockingIntegrityRules.length}
                            description="Can stop publish when enforcement is active."
                        />
                        <RuleSummaryTile
                            label="Total rules"
                            value={DATA_KEY_INTEGRITY_RULES.length}
                            description="Shared by scanner labels and publish blocker messages."
                        />
                    </div>

                    <div className="rounded-md border p-3 text-sm text-muted-foreground">
                        Policy settings decide when scans run and whether blocking rules stop publish. In block new issues only mode, known baseline issues may still be allowed.
                    </div>
                </CardContent>
            </Card>

            <IntegrityRuleSection
                title="Blocking rules"
                description="These findings can stop publish when integrity enforcement is active."
                rules={blockingIntegrityRules}
            />

            <IntegrityRuleSection
                title="Review states"
                description="These findings are shown in the registry so stale or ambiguous references can be reviewed, but they do not block publish by themselves."
                rules={reviewIntegrityRules}
            />

            <IntegrityRuleSection
                title="Healthy state"
                description="This is the expected state for managed script references."
                rules={healthyIntegrityRules}
            />
        </div>
    );
}
