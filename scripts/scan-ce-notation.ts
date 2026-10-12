/**
 * NEOAPP-1514 — notation audit.
 *
 * The existing scan-conditional-expressions.ts reports only blocking *errors*,
 * so it cannot answer this ticket: legacy "!" is a warning, and the
 * "!= chained with or" tautology is not diagnosed at all.
 *
 * This walks every conditional expression in every script and classifies it
 * against what the mobile runtime can actually evaluate today.
 *
 *   npx tsx scripts/scan-ce-notation.ts [scriptId] [--json out.json]
 */
import "@/server/env";

import { getScriptsWithItems } from "@/app/actions/scripts";
import { parse } from "@/lib/conditional-expression/parser";
import type { Node, ProgramNode } from "@/lib/conditional-expression/ast";
import { writeFileSync } from "node:fs";

type Tag =
  | "LEGACY_NOT"
  | "EXCLUDES_ANY"
  | "MEMBERSHIP_MULTI_VALUE"
  | "MEMBERSHIP_NOT_ALONE"
  | "OR_UNDERSCORE"
  | "NEQ_OR_TAUTOLOGY"
  | "EQ_AND_CONTRADICTION";

const TAG_NOTE: Record<Tag, string> = {
  LEGACY_NOT: 'legacy "!" negation — deprecated, editor warns',
  EXCLUDES_ANY: "BROKEN: runtime never negates `excludes`, evaluates as `includes`",
  MEMBERSHIP_MULTI_VALUE: "BROKEN: 2+ values emit bare and/or, eval() throws, silently false",
  MEMBERSHIP_NOT_ALONE: "BROKEN: membership combined with other logic — runtime drops the rest of the line",
  OR_UNDERSCORE: "or_excludes/or_includes — mobile-only, not in the editor grammar",
  NEQ_OR_TAUTOLOGY: "ALWAYS TRUE: != on one key chained with `or` (needs `and`)",
  EQ_AND_CONTRADICTION: "ALWAYS FALSE: = on one key chained with `and`",
};

type Row = {
  scriptTitle: string;
  scriptId: string;
  location: string;
  field: string;
  expression: string;
  tags: Tag[];
};

const walk = (node: Node | null | undefined, fn: (n: Node) => void): void => {
  if (!node) return;
  fn(node);
  switch (node.type) {
    case "Program": node.lines.forEach((n) => walk(n, fn)); break;
    case "Logical": walk(node.left, fn); walk(node.right, fn); break;
    case "Group": walk(node.expr, fn); break;
    case "Not": walk(node.expr, fn); break;
    case "Comparison": walk(node.left, fn); walk(node.right, fn); break;
    case "Membership": walk(node.target, fn); node.values.forEach((n) => walk(n, fn)); break;
    case "Array": node.items.forEach((n) => walk(n, fn)); break;
    default: break;
  }
};

/** Strips Group wrappers so we can see the operator underneath. */
const unwrap = (node: Node): Node => (node.type === "Group" ? unwrap(node.expr) : node);

/** Flattens a left/right Logical tree of one operator into its operands. */
const flatten = (node: Node, op: "and" | "or"): Node[] => {
  const inner = unwrap(node);
  if (inner.type === "Logical" && inner.op === op) {
    return [...flatten(inner.left, op), ...flatten(inner.right, op)];
  }
  return [inner];
};

const varName = (node: Node): string | null => {
  const inner = unwrap(node);
  return inner.type === "Var" ? inner.name.toLowerCase() : null;
};

const literal = (node: Node): string | null => {
  const inner = unwrap(node);
  return inner.type === "Literal" ? `${inner.value}`.toLowerCase() : null;
};

/**
 * `$X != 'a' or $X != 'b'` is true for every value of X. The mirror case,
 * `$X = 'a' and $X = 'b'`, is false for every value. Both are almost always a
 * De Morgan slip rather than intent.
 */
function findDegenerateChains(ast: ProgramNode): Tag[] {
  const tags = new Set<Tag>();

  const inspect = (node: Node, op: "and" | "or", cmpOp: string, tag: Tag) => {
    const operands = flatten(node, op);
    if (operands.length < 2) return;
    const byKey = new Map<string, Set<string>>();
    for (const operand of operands) {
      if (operand.type !== "Comparison" || operand.op !== cmpOp) continue;
      const key = varName(operand.left);
      const value = literal(operand.right);
      if (!key || value === null) continue;
      const seen = byKey.get(key) || new Set<string>();
      seen.add(value);
      byKey.set(key, seen);
    }
    for (const values of byKey.values()) if (values.size >= 2) tags.add(tag);
  };

  walk(ast, (node) => {
    if (node.type !== "Logical") return;
    if (node.op === "or") inspect(node, "or", "!=", "NEQ_OR_TAUTOLOGY");
    if (node.op === "and") {
      inspect(node, "and", "=", "EQ_AND_CONTRADICTION");
      inspect(node, "and", "==", "EQ_AND_CONTRADICTION");
    }
  });

  return [...tags];
}

function classify(expression: string): Tag[] {
  const tags = new Set<Tag>();
  if (/\bor_(excludes|includes)\b/i.test(expression)) tags.add("OR_UNDERSCORE");

  const { ast } = parse(expression);

  walk(ast, (node) => {
    if (node.type === "Not") tags.add("LEGACY_NOT");
    if (node.type === "Membership") {
      if (node.op === "excludes") tags.add("EXCLUDES_ANY");
      if (node.values.length >= 2) tags.add("MEMBERSHIP_MULTI_VALUE");
    }
  });

  // The runtime handles a membership line by returning early, so anything else
  // on that line is silently discarded.
  for (const line of ast.lines) {
    let hasMembership = false;
    walk(line, (n) => { if (n.type === "Membership") hasMembership = true; });
    if (hasMembership && unwrap(line).type !== "Membership") tags.add("MEMBERSHIP_NOT_ALONE");
  }

  findDegenerateChains(ast).forEach((t) => tags.add(t));
  return [...tags];
}

async function main() {
  const args = process.argv.slice(2);
  const jsonIndex = args.indexOf("--json");
  const jsonOut = jsonIndex > -1 ? args[jsonIndex + 1] : null;
  const scriptIdArg = args.find((a) => !a.startsWith("--") && a !== jsonOut);

  const res = await getScriptsWithItems(
    (scriptIdArg ? { scriptsIds: [scriptIdArg], returnDraftsIfExist: true } : { returnDraftsIfExist: true }) as any,
  );
  if (res.errors?.length) {
    console.error("Failed to load scripts:", res.errors.join(", "));
    process.exit(2);
  }

  const rows: Row[] = [];
  const corpus: { expression: string; location: string; scriptTitle: string }[] = [];
  let total = 0;

  for (const script of res.data as any[]) {
    const scriptId = `${script?.scriptId || ""}`;
    const scriptTitle = `${script?.title || script?.name || scriptId}`;

    const check = (expression: unknown, field: string, location: string) => {
      const value = `${expression ?? ""}`.trim();
      if (!value) return;
      total++;
      corpus.push({ expression: value, location, scriptTitle });
      const tags = classify(value);
      if (tags.length) rows.push({ scriptTitle, scriptId, location, field, expression: value, tags });
    };

    for (const screen of (script?.screens || []) as any[]) {
      const loc = `Screen "${screen?.title || screen?.key || screen?.screenId || ""}"`;
      check(screen?.condition, "condition", loc);
      check(screen?.skipToCondition, "skipToCondition", loc);
      for (const field of (screen?.fields || []) as any[]) {
        const fieldLoc = `${loc} > field "${field?.key || field?.label || ""}"`;
        check(field?.condition, "field.condition", fieldLoc);
        for (const item of (field?.items || []) as any[]) {
          check(item?.condition, "item.condition", `${fieldLoc} > option "${item?.value || item?.label || ""}"`);
        }
      }
      for (const item of (screen?.items || []) as any[]) {
        check(item?.condition, "item.condition", `${loc} > item "${item?.key || item?.label || ""}"`);
      }
    }
    for (const diagnosis of (script?.diagnoses || []) as any[]) {
      const loc = `Diagnosis "${diagnosis?.name || diagnosis?.key || ""}"`;
      check(diagnosis?.expression, "expression", loc);
      for (const symptom of (diagnosis?.symptoms || []) as any[]) {
        check(symptom?.expression, "symptom.expression", `${loc} > symptom "${symptom?.name || symptom?.key || ""}"`);
      }
    }
    for (const problem of (script?.problems || []) as any[]) {
      const loc = `Problem "${problem?.name || problem?.key || ""}"`;
      check(problem?.expression, "expression", loc);
      for (const symptom of (problem?.symptoms || []) as any[]) {
        check(symptom?.expression, "symptom.expression", `${loc} > symptom "${symptom?.name || symptom?.key || ""}"`);
      }
    }
  }

  console.log(`\nScanned ${(res.data as any[]).length} script(s), ${total} conditional expression(s).`);

  const counts = new Map<Tag, number>();
  for (const row of rows) for (const tag of row.tags) counts.set(tag, (counts.get(tag) || 0) + 1);

  console.log(`\n${rows.length} expression(s) flagged:\n`);
  for (const tag of Object.keys(TAG_NOTE) as Tag[]) {
    const n = counts.get(tag) || 0;
    if (n) console.log(`  ${String(n).padStart(4)}  ${tag}  — ${TAG_NOTE[tag]}`);
  }

  for (const tag of Object.keys(TAG_NOTE) as Tag[]) {
    const matching = rows.filter((r) => r.tags.includes(tag));
    if (!matching.length) continue;
    console.log(`\n━━━━ ${tag} (${matching.length}) ━━━━`);
    console.log(`     ${TAG_NOTE[tag]}\n`);
    for (const row of matching) {
      console.log(`  • ${row.scriptTitle} — ${row.location} [${row.field}]`);
      console.log(`      ${row.expression.replace(/\n/g, "\n      ")}`);
    }
  }

  if (jsonOut) {
    writeFileSync(jsonOut, JSON.stringify({ total, rows, corpus }, null, 2));
    console.log(`\nWrote ${jsonOut} (${rows.length} flagged, ${corpus.length} total expressions).`);
  }
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
