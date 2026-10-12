/**
 * Dumps every conditional expression from the given scripts, plus the key
 * catalogue needed to synthesise realistic answers, so the mobile runtime can
 * be simulated against real content outside this repo.
 *
 *   npx tsx scripts/dump-script-ces.ts <out.json> <scriptId> [scriptId...]
 */
import "@/server/env";

import { getScriptsWithItems } from "@/app/actions/scripts";
import { writeFileSync } from "node:fs";

type Expression = { location: string; field: string; expression: string };
type KeySpec = { key: string; type?: string; dataType?: string; options: string[] };

async function main() {
  const [out, ...scriptIds] = process.argv.slice(2);
  if (!out) {
    console.error("usage: dump-script-ces.ts <out.json> [scriptId...]   (no ids = every script)");
    process.exit(2);
  }

  const params = scriptIds.length
    ? { scriptsIds: scriptIds, returnDraftsIfExist: true }
    : { returnDraftsIfExist: true };
  const res = await getScriptsWithItems(params as any);
  if (res.errors?.length) {
    console.error("Failed to load scripts:", res.errors.join(", "));
    process.exit(2);
  }

  const scripts = (res.data as any[]).map((script) => {
    const expressions: Expression[] = [];
    const keys = new Map<string, KeySpec>();

    const add = (expression: unknown, field: string, location: string) => {
      const value = `${expression ?? ""}`.trim();
      if (value) expressions.push({ location, field, expression: value });
    };

    const noteKey = (key: unknown, type?: string, dataType?: string, items?: any[]) => {
      const name = `${key ?? ""}`.trim();
      if (!name) return;
      const existing = keys.get(name.toLowerCase());
      const options = (items || []).map((i) => `${i?.value ?? ""}`).filter(Boolean);
      if (existing) {
        options.forEach((o) => { if (!existing.options.includes(o)) existing.options.push(o); });
        return;
      }
      keys.set(name.toLowerCase(), { key: name, type, dataType, options });
    };

    for (const screen of (script?.screens || []) as any[]) {
      const loc = `Screen "${screen?.title || screen?.key || ""}"`;
      add(screen?.condition, "condition", loc);
      add(screen?.skipToCondition, "skipToCondition", loc);
      for (const field of (screen?.fields || []) as any[]) {
        noteKey(field?.key, field?.type, field?.dataType, field?.items);
        const fieldLoc = `${loc} > field "${field?.key || ""}"`;
        add(field?.condition, "field.condition", fieldLoc);
        for (const item of (field?.items || []) as any[]) {
          add(item?.condition, "item.condition", `${fieldLoc} > option "${item?.value || ""}"`);
        }
      }
      for (const item of (screen?.items || []) as any[]) {
        noteKey(item?.key, screen?.type, undefined, item?.items);
        add(item?.condition, "item.condition", `${loc} > item "${item?.key || ""}"`);
      }
    }
    for (const diagnosis of (script?.diagnoses || []) as any[]) {
      const loc = `Diagnosis "${diagnosis?.name || ""}"`;
      add(diagnosis?.expression, "expression", loc);
      for (const symptom of (diagnosis?.symptoms || []) as any[]) {
        add(symptom?.expression, "symptom.expression", `${loc} > symptom "${symptom?.name || ""}"`);
      }
    }
    for (const problem of (script?.problems || []) as any[]) {
      const loc = `Problem "${problem?.name || ""}"`;
      add(problem?.expression, "expression", loc);
      for (const symptom of (problem?.symptoms || []) as any[]) {
        add(symptom?.expression, "symptom.expression", `${loc} > symptom "${symptom?.name || ""}"`);
      }
    }

    return {
      scriptId: `${script?.scriptId || ""}`,
      title: `${script?.title || script?.name || ""}`,
      screenCount: (script?.screens || []).length,
      expressions,
      keys: [...keys.values()],
    };
  });

  writeFileSync(out, JSON.stringify({ scripts }, null, 2));
  for (const s of scripts) {
    console.log(`${s.title} (${s.scriptId}): ${s.screenCount} screens, ${s.expressions.length} expressions, ${s.keys.length} keys`);
  }
  console.log(`\nWrote ${out}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
