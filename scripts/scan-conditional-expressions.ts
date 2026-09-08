import "@/server/env";

import { getScriptsWithItems } from "@/app/actions/scripts";
import { collectScriptConditionFindings } from "@/lib/conditional-expression";
import { indexDataKeysById, resolveNuidLibraryKeys } from "@/lib/nuid-search";
import { _getDataKeys } from "@/databases/queries/data-keys";
import { _getConfigKeys } from "@/databases/queries/config-keys";

async function main() {
  const scriptIdArg = process.argv[2];
  const params = scriptIdArg
    ? { scriptsIds: [scriptIdArg], returnDraftsIfExist: true }
    : { returnDraftsIfExist: true };
  const res = await getScriptsWithItems(params as any);

  if (res.errors?.length) {
    console.error("Failed to load scripts:", res.errors.join(", "));
    process.exit(2);
  }

  const [registry, configurationKeys] = await Promise.all([
    _getDataKeys({ returnDraftsIfExist: true }),
    _getConfigKeys({ returnDraftsIfExist: true }),
  ]);
  if (configurationKeys.errors?.length) {
    console.error("Failed to load Configuration keys:", configurationKeys.errors.join(", "));
    process.exit(2);
  }
  const dataKeyIndex = indexDataKeysById((registry.data || []) as any);

  type Row = { scriptTitle: string; scriptId: string; location: string; field: string; expression: string; messages: string[] };
  const rows: Row[] = [];
  let expressionsWithErrors = 0;

  for (const script of res.data as any[]) {
    const scriptId = `${script?.scriptId || ""}`;
    const scriptTitle = `${script?.title || script?.name || scriptId}`;
    const findings = collectScriptConditionFindings({
      ...script,
      configurationKeys: configurationKeys.data || [],
      nuidDataKeys: resolveNuidLibraryKeys(script?.nuidSearchFields || [], dataKeyIndex),
    });
    for (const finding of findings) {
      expressionsWithErrors++;
      rows.push({
        scriptTitle,
        scriptId,
        location: finding.location,
        field: finding.field,
        expression: finding.expression,
        messages: finding.errors.map((e) => e.message),
      });
    }
  }

  console.log(`\nScanned ${(res.data as any[]).length} script(s).`);

  if (!rows.length) {
    console.log("No blocking errors found — safe to enable hard validation.\n");
    process.exit(0);
  }

  console.log(`\n${expressionsWithErrors} expression(s) would be blocked:\n`);
  const byScript = new Map<string, Row[]>();
  for (const row of rows) {
    const list = byScript.get(row.scriptTitle) || [];
    list.push(row);
    byScript.set(row.scriptTitle, list);
  }

  byScript.forEach((list, title) => {
    console.log(`\n━━ ${title} (${list[0].scriptId}) ━━`);
    list.forEach((row) => {
      console.log(`  • ${row.location} [${row.field}]`);
      console.log(`      expression: ${row.expression}`);
      row.messages.forEach((message) => console.log(`      ✗ ${message}`));
    });
  });

  console.log("");
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
