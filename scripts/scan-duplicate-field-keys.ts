import "@/server/env";

import { getScriptsWithItems } from "@/app/actions/scripts";
import { toConditionKeys } from "@/lib/conditional-expression";
import { findScriptFieldKeyCollisions, type FieldKeyCollision } from "@/lib/field-key-collisions";

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

  type Row = { scriptTitle: string; scriptId: string; collision: FieldKeyCollision };
  const rows: Row[] = [];

  for (const script of res.data as any[]) {
    const scriptId = `${script?.scriptId || ""}`;
    const scriptTitle = `${script?.title || script?.name || scriptId}`;
    const collisions = findScriptFieldKeyCollisions({
      scriptId,
      title: scriptTitle,
      screens: script?.screens || [],
      dataKeys: toConditionKeys(script?.dataKeys || []),
    });
    for (const collision of collisions) rows.push({ scriptTitle, scriptId, collision });
  }

  console.log(`\nScanned ${(res.data as any[]).length} script(s).`);

  if (!rows.length) {
    console.log("No duplicate field keys found — safe to enable the publish gate.\n");
    process.exit(0);
  }

  const blocking = rows.filter((row) => row.collision.severity === "blocking");
  const warnings = rows.filter((row) => row.collision.severity === "warning");

  console.log(
    `\n${blocking.length} collision(s) would block publishing, ${warnings.length} would warn:\n`,
  );

  const byScript = new Map<string, Row[]>();
  for (const row of rows) {
    const list = byScript.get(row.scriptTitle) || [];
    list.push(row);
    byScript.set(row.scriptTitle, list);
  }

  byScript.forEach((list, title) => {
    console.log(`\n━━ ${title} (${list[0].scriptId}) ━━`);
    list.forEach(({ collision }) => {
      const mark = collision.severity === "blocking" ? "✗" : "!";
      console.log(`  ${mark} ${collision.location} [${collision.displayKey}] — ${collision.kind} (${collision.verdict})`);
      console.log(`      ${collision.message}`);
      collision.members.forEach((member) => {
        const condition = member.condition ? ` when ${member.condition}` : " (no condition)";
        console.log(`        · "${member.label}"${condition}`);
      });
    });
  });

  console.log("");
  process.exit(blocking.length ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
