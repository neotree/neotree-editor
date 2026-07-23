/**
 * Read-only corpus scan: runs the conditional-expression validator against
 * every expression already stored in the database and reports the ones that
 * would produce a blocking ERROR under the new editor validation.
 *
 * Run BEFORE enabling hard save-blocking, to surface false positives (valid
 * expressions our validator wrongly rejects) and genuinely broken expressions.
 *
 *   yarn tsx scripts/scan-conditional-expressions.ts
 *
 * Exits with code 1 if any errors are found (so it can gate CI), 0 otherwise.
 */
import "@/server/env";

import { getScriptsWithItems } from "@/app/actions/scripts";
import {
  validateCondition,
  validateReferenceExpression,
  type ConditionKey,
  type Diagnostic,
} from "@/lib/conditional-expression";

type Finding = {
  scriptId: string;
  scriptTitle: string;
  location: string;
  field: string;
  expression: string;
  errors: Diagnostic[];
};

function toConditionKeys(dataKeys: any[] = []): ConditionKey[] {
  return (dataKeys || [])
    .map((key: any) => {
      const name = `${key?.name || ""}`.trim();
      return {
        name,
        label: `${name}${key?.label ? ` - ${key.label}` : ""}`,
        dataType: `${key?.dataType || ""}`.trim(),
      };
    })
    .filter((key) => !!key.name);
}

const onlyErrors = (diagnostics: Diagnostic[]) => diagnostics.filter((d) => d.severity === "error");

async function main() {
  const res = await getScriptsWithItems({ returnDraftsIfExist: true } as any);

  if (res.errors?.length) {
    console.error("Failed to load scripts:", res.errors.join(", "));
    process.exit(2);
  }

  const findings: Finding[] = [];
  let expressionsScanned = 0;

  for (const script of res.data as any[]) {
    const scriptId = `${script?.scriptId || ""}`;
    const scriptTitle = `${script?.title || script?.name || scriptId}`;
    const keys = toConditionKeys(script?.dataKeys);
    const scriptCtx = { keys, allowSelf: true };
    // Drug items validate against a different (library-wide) key set live,
    // so only check their syntax here to avoid false unknown-key reports.
    const syntaxOnlyCtx = { keys: [] as ConditionKey[], allowSelf: true, skipKeyResolution: true };

    const check = (
      expression: unknown,
      field: string,
      location: string,
      opts?: { mode?: "boolean" | "reference"; ctx?: typeof scriptCtx | typeof syntaxOnlyCtx },
    ) => {
      const value = `${expression ?? ""}`.trim();
      if (!value) return;
      expressionsScanned++;
      const ctx = opts?.ctx ?? scriptCtx;
      const result =
        opts?.mode === "reference"
          ? validateReferenceExpression(value, ctx)
          : validateCondition(value, ctx);
      const errors = onlyErrors(result.diagnostics);
      if (errors.length) {
        findings.push({ scriptId, scriptTitle, location, field, expression: value, errors });
      }
    };

    for (const screen of (script?.screens || []) as any[]) {
      const loc = `Screen "${screen?.title || screen?.key || screen?.screenId || ""}"`;
      check(screen?.condition, "condition", loc);
      check(screen?.skipToCondition, "skipToCondition", loc);
      for (const field of (screen?.fields || []) as any[]) {
        const fieldLoc = `${loc} > field "${field?.key || field?.label || ""}"`;
        check(field?.condition, "field.condition", fieldLoc);
        check(field?.calculation, "field.calculation", fieldLoc, { mode: "reference" });
      }
    }

    for (const diagnosis of (script?.diagnoses || []) as any[]) {
      check(diagnosis?.expression, "expression", `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`);
    }

    for (const problem of (script?.problems || []) as any[]) {
      check(problem?.expression, "expression", `Problem "${problem?.name || problem?.key || ""}"`);
    }

    for (const item of (script?.drugsLibrary || []) as any[]) {
      const loc = `Drug/Fluid "${item?.drug || item?.fluid || item?.key || ""}"`;
      check(item?.condition, "condition", loc, { ctx: syntaxOnlyCtx });
      check(item?.calculator_condition, "calculator_condition", loc, { ctx: syntaxOnlyCtx });
    }

    const eligibility = script?.eligibilityCriteria;
    if (eligibility) {
      check(eligibility?.criteria_condition, "criteria_condition", "Eligibility criteria");
      check(eligibility?.alternative_criteria_condition, "alternative_criteria_condition", "Eligibility criteria (alternative)");
    }
  }

  console.log(`\nScanned ${expressionsScanned} expression(s) across ${(res.data as any[]).length} script(s).`);

  if (!findings.length) {
    console.log("✅ No blocking errors found — safe to enable hard validation.\n");
    process.exit(0);
  }

  console.log(`\n❌ ${findings.length} expression(s) would be blocked:\n`);
  const byScript = new Map<string, Finding[]>();
  for (const finding of findings) {
    const list = byScript.get(finding.scriptTitle) || [];
    list.push(finding);
    byScript.set(finding.scriptTitle, list);
  }

  byScript.forEach((list, title) => {
    console.log(`\n━━ ${title} (${list[0].scriptId}) ━━`);
    list.forEach((finding) => {
      console.log(`  • ${finding.location} [${finding.field}]`);
      console.log(`      expression: ${finding.expression}`);
      finding.errors.forEach((error) => console.log(`      ✗ ${error.message}`));
    });
  });

  console.log("");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
