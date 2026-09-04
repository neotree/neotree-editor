import "@/server/env";

import { getScriptsWithItems } from "@/app/actions/scripts";
import {
  applyScreenOptionMerges,
  planScreenOptionMerges,
  type OptionMergePlan,
} from "@/lib/field-key-collisions/merge-option-fields";
import { _saveScreens } from "@/databases/mutations/scripts";

/**
 * Migrates the "one question split into N duplicate-keyed fields" pattern into
 * a single field whose options carry the conditions.
 *
 * Dry-run by default — it prints exactly what it would change and exits. Pass
 * --apply to write, which saves screen DRAFTS through the normal mutation, so
 * the change is reviewable in the editor and goes out on the next publish.
 *
 *   yarn merge:option-fields                       # every script, dry run
 *   yarn merge:option-fields <scriptId>            # one script, dry run
 *   yarn merge:option-fields <scriptId> --apply --user <userId>
 */

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const userIndex = args.indexOf("--user");
  const userId = userIndex >= 0 ? args[userIndex + 1] : undefined;
  const scriptIdArg = args.find((arg) => !arg.startsWith("--") && arg !== userId);

  const res = await getScriptsWithItems(
    (scriptIdArg
      ? { scriptsIds: [scriptIdArg], returnDraftsIfExist: true }
      : { returnDraftsIfExist: true }) as any,
  );

  if (res.errors?.length) {
    console.error("Failed to load scripts:", res.errors.join(", "));
    process.exit(2);
  }

  let planned = 0;
  let blocked = 0;
  let fieldsRemoved = 0;
  const writes: { scriptId: string; screen: any; fields: any[]; plans: OptionMergePlan[] }[] = [];

  for (const script of res.data as any[]) {
    const scriptId = `${script?.scriptId || ""}`;
    const scriptTitle = `${script?.title || scriptId}`;
    let printedScript = false;
    const printScript = () => {
      if (printedScript) return;
      printedScript = true;
      console.log(`\n━━ ${scriptTitle} (${scriptId}) ━━`);
    };

    for (const screen of (script?.screens || []) as any[]) {
      const { plans, blockers } = planScreenOptionMerges(screen);
      if (!plans.length && !blockers.length) continue;

      printScript();
      console.log(`\n  Screen "${screen?.title || screen?.screenId}"`);

      for (const plan of plans) {
        planned++;
        fieldsRemoved += plan.removedIndexes.length;
        console.log(
          `    ✓ ${plan.displayKey}: ${plan.sourceFieldCount} fields → 1 field with ${plan.mergedItems.length} conditioned options`,
        );
        console.log(`        field shown when: ${plan.mergedCondition || "always"}`);
        if (plan.sharedOptions.length) {
          console.log(
            `        offered by more than one source: ${plan.sharedOptions
              .map((option) => `${option.value} (${option.sources})`)
              .join(", ")}`,
          );
        }
        for (const item of plan.mergedItems.slice(0, 3)) {
          console.log(`        · ${item.value} — ${item.condition || "always"}`);
        }
        if (plan.mergedItems.length > 3) console.log(`        · …and ${plan.mergedItems.length - 3} more options`);
      }

      for (const blocker of blockers) {
        blocked++;
        console.log(`    ✗ ${blocker.displayKey}: not merged — ${blocker.reason}`);
      }

      if (plans.length) {
        writes.push({ scriptId, screen, fields: applyScreenOptionMerges(screen, plans), plans });
      }
    }
  }

  console.log(
    `\nScanned ${(res.data as any[]).length} script(s): ${planned} merge(s) planned, ${fieldsRemoved} duplicate field(s) removed, ${blocked} left for review.`,
  );

  if (!apply) {
    console.log(writes.length ? "\nDry run — pass --apply to save these as drafts.\n" : "\nNothing to merge.\n");
    process.exit(0);
  }

  if (!writes.length) {
    console.log("");
    process.exit(0);
  }

  if (!userId) {
    console.log("\nNote: no --user given, so drafts will not be attributed to an editor account.");
  }

  let saved = 0;
  for (const write of writes) {
    const { screenId, ...rest } = write.screen;
    const result = await _saveScreens({
      data: [{ ...rest, screenId, scriptId: write.scriptId, fields: write.fields } as any],
      userId,
      draftOrigin: "other",
      broadcastAction: false,
    });
    if (!result.success) {
      console.error(`  ✗ Failed to save screen ${screenId}: ${(result.errors || []).join(", ")}`);
      continue;
    }
    (result.warnings || []).forEach((warning) => console.log(`  ! ${warning}`));
    saved++;
  }

  console.log(`\nSaved ${saved} screen draft(s). Review them in the editor, then publish.\n`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
