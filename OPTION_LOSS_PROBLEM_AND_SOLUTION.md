# Dropdown and select options lost after DEV → LIVE imports: problems, origins and solution

| | |
|---|---|
| **Problems in** | `master` @ `e5112c6cf`, the code `prod` runs |
| **Fixed in** | `enhancements/imports` @ `dbb329b1a` (121 files, +8,790 / −1,643 against master) |
| **Ticket** | NEOAPP-1526 (options and data keys disappearing) |
| **Data** | The options already lost were restored by hand. This work is about making sure it can't happen again. |

How to read the references:
- `master:path:line` is the code that causes a problem.
- `path:line` with no prefix is the fix on `enhancements/imports`.
- **Blame** lines come from `git blame master`. They show the commit that last wrote those exact lines: author, date and commit message.
- **Introduced** is the commit where the behaviour first appeared, when that differs from the blame.

A note on the blame. It's included because it was asked for and because it explains the timing. It isn't a judgement on anyone. Almost every commit below was a reasonable change on its own. The loss came from how several of them combined, and nothing tested the combination.

---

## Contents

1. [Summary](#1-summary)
2. [Why it showed up only recently, and why nobody caught it](#2-why-it-showed-up-only-recently-and-why-nobody-caught-it)
3. [Background: how content moves between DEV and LIVE](#3-background-how-content-moves-between-dev-and-live)
4. [The problems, file by file](#4-the-problems-file-by-file)
5. [The solutions, problem by problem](#5-the-solutions-problem-by-problem)
6. [New safeguards that go beyond the original problems](#6-new-safeguards-that-go-beyond-the-original-problems)
7. [Problem → fix map](#7-problem--fix-map)
8. [What users will notice](#8-what-users-will-notice)
9. [How it was verified](#9-how-it-was-verified)
10. [Deploying](#10-deploying)

---

## 1. Summary

Clinical content is built on the DEV editor and copied to the LIVE editor with **Import**. Options kept disappearing from dropdown, single-select and multi-select questions on LIVE, sometimes several times for the same question.

There was no single bug. **26 separate causes** (plus 4 editor bugs found while testing the fix) fall into four groups:

1. **The import replaced the LIVE script wholesale.**
   - Every LIVE screen was deleted and recreated from DEV's published copy.
   - With "Overwrite datakeys" ticked, which was the default, LIVE's data-key option lists were replaced with DEV's.
   - Anything that existed only on LIVE disappeared.
2. **Several editing paths removed options by themselves**, and the next import copied the loss:
   - deleting one option row in the data-key editor
   - option cleanup that overwrote drafts
   - stale forms saving old option lists
   - a picker that dropped hidden selections
3. **Recovery tools made it worse.** Rollbacks deleted keys and screens.
4. **The damage spread before anyone noticed:**
   - Tablets were served unpublished drafts.
   - A broken drug-library import blocked publishing, so users discarded drafts.
   - Export reported success while failing.

**Evidence:** in the copy of the demo database, one import of Neotree Admission on 2026-09-17 08:55 removed **366 options from 39 screens**:
- "Plan": 121 → 25 options
- "HCWSig": 136 → 37 options
- "Referred from": 90 → 30 options

**The fix:**
- The import is now a **three-way merge**. It keeps LIVE-only content, applies only what DEV changed since the last import, and never removes anything on a first import.
- Every path that removed options was fixed.
- Saves are all-or-nothing.
- Imports need a preview.
- An optional **content sync** keeps DEV and LIVE from drifting apart in the first place.

**Result:** the full DEV/LIVE simulation on fresh database copies passes **54/54**, with zero options lost that DEV had not removed. The follow-up checks pass too (43/43 API, 12/12 and 25/25 in the browser).

---

## 2. Why it showed up only recently, and why nobody caught it

### 2.1 The timeline

The dangerous behaviour of the import is old (August 2024), but it stayed harmless for over a year. LIVE rarely had content of its own, so "replace LIVE with DEV" lost nothing. What changed is that **several unrelated commits between October 2025 and September 2026 stacked up**. Each one removed a safety margin. The last few landed within one week in September 2026, which is when people started noticing.

| Date | Commit | Author | What it changed | Effect on option loss |
|---|---|---|---|---|
| 2024-08-11 | `0c6f3bdd5` "copy scripts" | farai | Import copies the source script and **drops the link between old and new ids** (`saveScriptScreens` strips `oldScreenId`) | Every import recreates screens with new ids; nothing remembers what LIVE had (#1, #21) |
| 2024-08-11 | `c6a70de2c` "duplicate scripts" | farai | Script queries treat **queued** deletions as already deleted | DEV deletions that were only queued are applied by imports (#5) |
| 2024-10-07 | `ad20959c0` "process pending deletion" | farai | Publish processes queued script deletions with a user filter inside a ternary | "Publish my changes" applies other users' queued deletions (#16) |
| 2024-10-20 | `7bb53e718` "app auth JWT" | farai | The tablet sync route asks for `returnDraftsIfExist: true` | **Tablets get unpublished drafts**: any draft-level loss reaches devices before review (#22) |
| 2025-09-28 | `908a4bf43` "datakeys" | farai | Data-key form rows built from a filtered list but deleted by index; pickers filtered by the parent key | The wrong option row can be deleted (#7); options not in the parent key can't be re-picked (#3) |
| 2025-10-05 | `1245a9f8b` "datakeys" | farai | The with-items route reads `body.data.data` | Export always fails (#24) |
| 2025-10-08 | `24547a24e` "datakeys" | farai | **Imports start overwriting LIVE's data-key option lists** with DEV's | LIVE-only options vanish from the key library, not just from screens (#2), and links are re-guessed by name (#4) |
| 2025-10-10 | `943ef8ec3` "datakeys" | farai | **"Overwrite datakeys" ticked by default**; banner says keys "will be appended" | Users unknowingly ran the destructive mode on every import (#2) |
| 2025-10-23 | `abe249f53` "change logs ui done and dusted now testing" | KumaloWilson | Screen form's reset after a refresh commented out | Stale forms save old option lists over newer ones (#11, E2) |
| 2025-11-28 | `6286ed70d` "version control feature ready to roll out" | KumaloWilson | Release rollback introduced; baseline changelog rows stamped with the current release | Rollback treats pre-existing keys as "created later" and soft-deletes them (#18) |
| 2026-03-17 | `dd3ffba7b` "datakey syncing" | KumaloWilson | Key changes cascade into every script that references the key | Cascades write drafts in every script, including into other users' work (#10) |
| 2026-04-15 | `5010996e8` "tightening the publish flow" | KumaloWilson | Script rollback bounds child rows by the script row's last release | Rollback restores screens to the wrong version (#19) |
| 2026-04-24 | `afb95fac3` "implementing through changelogs testing" | KumaloWilson | Data-key rollback may soft-delete dependants | Rolling back a key deletes screens (#20) |
| 2026-05-13 | `061765d67` "tighten datakey integrity…" | KumaloWilson | `/api/data-keys` reads flat query params only | Another editor's import receives **unpublished** data-key drafts (#5) |
| 2026-06-21 | `8609e136b` "Delete referenced data key options" | farai | **Removing an option from one key strips it from every question in every script** | One option-row deletion removes "Yes" from 199 items in 9 scripts (#7, #9) |
| 2026-09-14 | `b7c6a6ba6` "search and replace, bug fix" | KumaloWilson | Option-label matches sent down the field branch | Search & replace on an option rewrites the field label (#17) |
| 2026-09-18 | `f74e37502` "Reject saving/publishing a data key with both flags…" | mbaradza | Confidentiality inherited on screens with a strict compare | Opening a screen counts as an edit (E1); with an import, can block publishing |
| **2026-09-21** | `a81c3b2d6` "load remote data" | farai | Remote loaders rewritten; **drug library fetched from `/api/problems`**; data-key drafts leak again | The next LIVE publish fails, so users press "Discard", which throws away the imported options too (#23, #5) |
| **2026-09-22** | `40f5027cd`, `88d37d4cd`, `68a4f393f` "remove 'publish everything' and 'discard everything'" | farai | Only "my changes" can be published or discarded from the UI | Ownerless drafts (API key, CLI) and other users' cascade drafts get stuck (#10, #26) |
| **2026-09-23** | `a690b3737` "run script imports as background jobs…" | mbaradza | Imports and exports become background jobs; the overwrite path moves into a job; job cache keyed without the flags | Export says "success" while the job fails (#24); changing "Overwrite datakeys" has no effect for 10 minutes (#25) |
| 2026-09-17 and 2026-09-24 | (real imports, from server logs) | users | Imports ran with `overwriteDataKeys: true` | "Plan" shrank 121 → 35 options in the key library; "Risk" went 33 → 0 |

So the September reports didn't come from one new bug. They came from:
- A **year-old** destructive import that only became harmful once LIVE had its own content.
- An **October 2025** default that made it delete from the key library too.
- A **June 2026** cleanup that removed options everywhere.
- A **September 2026** burst of four changes in five days: draft leak, drug bug, publish-all removed, background jobs. These made imports fail, half-apply or get discarded.

### 2.2 Why nobody caught it

1. **Each mechanism looked like intended behaviour on its own.**
   - "Import copies DEV" is the design.
   - "Removing an option from a key removes it from its questions" is the design.
   - "Overwrite datakeys" sounds like a feature.
   - The bugs were in the details: no memory of what LIVE had, "every question" instead of "this key's questions", ticked by default, a banner that said "appended".
2. **The loss was silent.**
   - Nothing errored and nothing was logged as "option removed".
   - Imports recreated screens with new ids, so the changelog saw "new screens" rather than "options removed from a screen" (#21).
   - The loss looked like an ordinary import.
3. **It showed up late and somewhere else.**
   - The damage happened on DEV (cleanup, stale forms) or in drafts, and only surfaced on LIVE after the next import and publish, often days later.
   - People re-added options; the next import removed them again. To users this looked like someone else's mistake, not a bug.
4. **There were no tests for imports, data-key cascades or rollbacks.**
   - `master`'s `npm test` runs 29 test files. The import-related one, `tests/integrity-imports.test.ts`, checks the integrity review after an import, not what an import does to a script.
   - Nothing exercised an import between two editors, a cascade across scripts or a rollback after an import.
   - This branch adds `tests/import-merge.test.ts`, `tests/import-option-loss-fixes.test.ts`, `tests/content-sync.test.ts` and `tests/internal-call.test.ts`, plus a two-editor simulation.
5. **Failures pushed users towards the destructive action.**
   - The drug-library bug (#23) made publishing fail, so the natural fix was "Discard changes".
   - Export said "success" while failing (#24), so people believed DEV and LIVE matched when they didn't.
6. **Tablets received drafts (#22).** Options lost in drafts reached devices before anyone reviewed them, so the "source of truth" was already damaged when problems were reported.

---

## 3. Background: how content moves between DEV and LIVE

**Two editors.** DEV and LIVE run the same Next.js app, each with its own Postgres database. They talk through each other's REST API with an API key (`x-api-key`). Each editor knows the other as a row in `nt_sites`.

**Drafts and publish.**
- Every content table has a `*_drafts` twin. Editing writes a draft owned by the user (`created_by_user_id`).
- **Publish** copies drafts into the main tables, bumps `data_version` and writes changelogs.
- Deletions are queued in `nt_pending_deletion` and applied on publish.

**Data keys.**
- A data key defines a question or an option: `uniqueKey`, `name`, `label`, `dataType`. A question key also has `options`, a list of option keys' `uniqueKey`s.
- A dropdown screen links to its key (`keyId`), and its `items` are that key's options.
- Changing a key cascades into every screen, diagnosis and problem that uses it (`_updateDataKeysRefs`). Those cascades create drafts.

**Import on master** (`master:app/actions/scripts.ts`, `copyScripts`):
1. LIVE fetches DEV's script, screens, diagnoses, problems, data keys and drugs over HTTP (`master:app/actions/remote.ts`).
2. With "overwrite", it deletes the LIVE script's items and saves DEV's with new ids.
3. `parseImportedDataKeys` (`master:lib/data-keys.ts`) decides which keys to save, and saves them.

---

## 4. The problems, file by file

Each problem gives:
- **Symptom:** what users see.
- **Code:** master file and lines, with the key excerpt.
- **What it does:** how the code adds to the loss.
- **Blame:** the last commit that wrote those lines.
- **Introduced:** where the behaviour began, when that differs.

### A. The import itself

#### Problem 1: "Import and overwrite" replaces the whole LIVE script (critical)

**Symptom:** options, screens and wording added on LIVE disappear after every import, whatever the checkboxes say.

**Code:**

1. `master:app/actions/scripts.ts:2638-2665`: every imported screen, diagnosis and problem gets a **new id**. There's no map from DEV ids to LIVE ids, so nothing can be matched up later.
   - Blame: `b84dd218d` farai 2025-06-18 "import scripts & link screens" (12 lines), `41f896b24` farai 2025-03-18 "print sections", `40f21e340` farai 2025-05-26, `b568e0961` farai 2026-03-22 "problems", `2f911c8e0` KumaloWilson 2026-08-27 "finalization".
2. `master:app/actions/scripts.ts:2682-2689`: the whole target script is emptied first:
   ```ts
   if (overWriteScript?.data) {
       const delRes = await deleteScriptsItems({
           scriptsIds: [overWriteScript.data.scriptId],
           draftOrigin,
           client: tx,
       });
   ```
   Blame: `a690b3737` mbaradza 2026-09-23 "fix: run script imports as background jobs…". This commit moved the code into a job. The behaviour itself is older (see Introduced).
3. `master:app/actions/scripts.ts:2691-2704`: the target is renamed to the source's title. Blame: `a690b3737` mbaradza 2026-09-23.
4. `master:databases/mutations/scripts/_screens_delete.ts:54-60`: **all users' drafts** on those screens are hard-deleted.
   - Blame: `4d274099a` farai 2024-08-29 "api", `4e96f65fb` farai 2024-08-09 "scripts", `a690b3737` mbaradza 2026-09-23.
5. `master:databases/mutations/scripts/_screens_delete.ts:63-86`: every published LIVE screen is queued for deletion.
   - Blame: `4e96f65fb` farai 2024-08-09 (15 lines), `dd7aad1dc` farai 2025-09-30 "lock drafts", `5ad177e5d` KumaloWilson 2026-05-03.
6. `master:app/actions/scripts.ts:2220`: `saveScriptScreens` strips `oldScreenId`. Blame: `0c6f3bdd5` farai 2024-08-11 "copy scripts".

**What it does:** the import is a faithful copy of DEV's published state. Nothing records what LIVE had, so whatever exists only on LIVE is deleted. We checked this: over four imports, 151 option lists were copied 1:1 with zero differences from DEV. New ids every time also destroy option-level history (#21).

**Introduced:** `0c6f3bdd5` farai 2024-08-11 "copy scripts".

#### Problem 2: "Overwrite datakeys" replaces LIVE's data-key option lists (critical)

**Symptom:** a question's option list in LIVE's key library shrinks to DEV's list. Pickers and integrity checks then treat LIVE-only options as invalid.

**Code:**

1. `master:app/(dashboard)/(scripts)/components/scripts-import-modal.tsx:40-41`: on by default:
   ```ts
   overwriteDataKeys: true,
   overwriteDrugsLibraryItems: true,
   ```
   - Blame: `943ef8ec3` farai 2025-10-10 "datakeys".
   - The banner at `:361` says the opposite of what happens: `New data keys, drugs, feeds & fluids <b>will be appended</b> to the library` (same commit). The label is at `:416` (same commit).
2. `master:lib/data-keys.ts:325-328`: LIVE-only options are filtered out *before* the comparison:
   ```ts
   localDataKeys = localDataKeys.map(k => ({
       ...k,
       options: k.options.filter(o => importedUniqueIdDataKeyMap[o]),
   }));
   ```
   Blame: `24547a24e` farai 2025-10-08 "datakeys".
3. `master:lib/data-keys.ts:330-346`: the parsed key takes DEV's option list as it is.
   - Blame: `24547a24e` farai 2025-10-08 (13 lines), `f6c87b850` farai 2025-10-19, `943ef8ec3` farai 2025-10-10.
4. `master:lib/data-keys.ts:348-367`: `canSave` is decided by a JSON match on name, label and type, not by whether the imported script uses the key. Same-named keys belonging to other scripts get overwritten too.
   - Blame: `24547a24e` farai 2025-10-08 (19 lines), `f6c87b850` farai 2025-10-19.
   - `master:lib/data-key-types.ts:35-37` collapses dropdown and single_select into one type, which widens that match. Blame: `11ceed98a` KumaloWilson 2026-04-01 "adding rules for each status".
5. `master:lib/data-keys.ts:369-382`: the overwrite spreads to the option keys. Blame: `b52a7b6ae` farai 2025-10-09.
6. `master:app/actions/scripts.ts:2899-2903`, `2978-2998`: the parsed keys are saved. Blame: `f6c87b850` / `24547a24e` / `943ef8ec3` farai (Oct 2025); later edits by KumaloWilson (2026-04/05) and mbaradza (2026-09-25).
7. `master:databases/mutations/data-keys/_update_data_keys_refs.ts:662-669`: the cascade then relabels other scripts. Blame: `dd3ffba7b` KumaloWilson 2026-03-17 "datakey syncing".

**What it does:**
- LIVE's own options are removed from the comparison, DEV's list is saved, and the cascade pushes the change into every script.
- The default was "on" and the banner said "appended", so users didn't know they had chosen the destructive mode.
- Server logs show every real import on 24 Sep 2026 ran with `overwriteDataKeys: true`. Those imports shrank "Plan" from 121 to 35 options and emptied "Risk" (33 → 0).

**Introduced:**
- `24547a24e` farai 2025-10-08 started overwriting option lists. Before it, imports only added missing keys (`_saveDataKeysIfNotExist`).
- `943ef8ec3` farai 2025-10-10 made it the default.

#### Problem 3: with the box unticked, LIVE's keys go stale and pickers hide options (high)

**Symptom:** a LIVE option that DEV doesn't have survives in the screen, but can't be picked again.

**Code:**
1. `master:app/actions/scripts.ts:2901-2903`: only `isNew` keys are saved when the box is off. Existing LIVE keys never receive the options DEV added. Blame: `f6c87b850` / `24547a24e` / `943ef8ec3` farai, Oct 2025.
2. The pickers only offer options that are in the parent key's list:
   - `master:app/(dashboard)/(scripts)/components/screens/field-items.tsx:375-379`. Blame: `068c8a9e6` mbaradza 2026-05-20 "Add Eligibility Criteria".
   - `master:.../screens/field.tsx:433-437`. Blame: `5f48a2857` KumaloWilson 2025-10-30, `ff589764e` farai 2026-06-21.
   - `master:.../screens/item.tsx:246-254`. Blame: `5f48a2857` KumaloWilson 2025-10-30 "tracking changes on screen form…".

**What it does:** with the box off, imported screens reference options that LIVE's parent key doesn't list, so they can't be re-picked. With the box on, see #2. Neither choice was safe.

**Introduced:** picker filtering `908a4bf43` farai 2025-09-28 "datakeys"; the save filter in the Oct 2025 commits above.

#### Problem 4: data-key links re-guessed by name, label and type (high)

**Symptom:** after an import, a question is linked to the wrong key (one with none of its options), or to no key.

**Code:**
- `master:lib/data-keys.ts:384-481` re-resolves every reference with `pickDataKey`. Blame: `24547a24e` farai 2025-10-08 (79 lines), `b568e0961` farai 2026-03-22, `efa27db79` farai-bws 2025-11-14, `bf7c297b2` farai 2025-10-14, `35ae6be35` farai 2025-10-08.
- `pickDataKey` takes the first match (`master:lib/data-keys.ts:95-111`). Blame: `d67c80efb` KumaloWilson 2026-09-09, `8df2d0d99` farai 2025-10-06, `ced26b278` farai 2025-10-08.

**What it does:** any wording difference gives `keyId: undefined`, and same-named duplicates are picked at random.

**Evidence:** "Tone", "AdmReason", and "Generic PHC NEURO EXAM Activity", which was re-pointed to a SMCH key with none of its options.

#### Problem 5: published, draft and pending-deletion state mixed up (high)

**Symptom:**
- DEV's unpublished option **keys** arrive on LIVE without the screens that use them.
- DEV's unpublished **screen** changes don't arrive at all.
- Deletions DEV only queued are applied on LIVE.

**Code:**
1. `master:app/actions/remote.ts:316-321` sends `?data={...returnDraftsIfExist:false}`. Blame: `a81c3b2d6` farai 2026-09-21 "load remote data".
2. `master:app/api/data-keys/route.ts:23-31` only reads flat query params, never `data`. Blame: `061765d67` KumaloWilson 2026-05-13.
3. So `returnDraftsIfExist` falls back to its default `true` (`master:databases/queries/data-keys/_get.ts:77`). Blame: `f953d674c` farai 2025-09-12.
4. Screens, diagnoses and problems are fetched published-only (`master:app/actions/remote.ts:88, 129`; blame `a81c3b2d6` farai 2026-09-21).
5. Queued deletions count as deleted: `master:databases/queries/scripts/_screens_get.ts:160` (blame `c6a70de2c` farai 2024-08-11) and `master:databases/queries/data-keys/_get.ts:155` (blame `803b5d808` farai 2025-04-29).

**What it does:** the import mixes three different states of DEV: published screens, draft keys, and deletions that haven't happened yet.

#### Problem 6: no server-side safety checks on import (high)

**Symptom:** an import wipes another user's work in progress, and a wrong source script id replaces and renames a LIVE script.

**Code:**
- **The "working on this" lock is UI-only.** `master:hooks/use-is-locked.ts:8` (blame `a239ef763` farai 2025-09-30 "drafts").
- **The copy route only checks login.** `master:app/api/scripts/copy/route.ts:10-39` (blame `a690b3737` mbaradza 2026-09-23 for 25 lines, `5cd6d170a` farai 2024-08-29) and a bare `isAllowed()` at `master:app/actions/scripts.ts:2817` (blame `ab3c1eb0f` farai 2025-10-29).
- **Any source id is accepted.** The modal's free-text "Script ID" box takes anything.

### B. Editing paths that lose options (the next import copies the loss)

#### Problem 7: deleting one option row in the data-key editor removes it everywhere (critical)

**Symptom:** removing "Yes" from one key removes "Yes" from every question in every script: 199 items, 79 questions, 9 scripts on the demo data. The "Affected entities" preview doesn't show this.

**Code:**
1. `master:app/(dashboard)/data-keys/components/form.tsx:716-723`: each row deletion appends to `deletedUniqueKeys`, and that list is never reconciled with the final list. Re-adding an option, or a type change (`:503-511`), still deletes it.
   - Blame: `8609e136b` farai 2026-06-21 "Delete referenced data key options" (`:503-511`: `908a4bf43` farai 2025-09-28).
2. `master:app/(dashboard)/data-keys/components/form.tsx:268-270`, `:741-746`: rows are built from a filtered list but deleted by index, so a dangling option shifts the indexes and the **wrong** option is removed.
   - Blame: `908a4bf43` farai 2025-09-28, `213efba67` farai 2025-09-19.
3. `master:databases/mutations/data-keys/_save.ts:326`: the cleanup is called with just the option keys, **no parent**. Blame: `8609e136b` farai 2026-06-21.
4. `master:databases/mutations/data-keys/_delete-referenced-options.ts:36-45` removes the option from every question that has it, and drops whole fields:
   ```ts
   items: items.filter(f => !uniqueKeys.includes(f.keyId!)),
   fields: fields.filter(f => !uniqueKeys.includes(f.keyId!)).map(f => ({
       ...f,
       items: (f.items || []).filter(f => !uniqueKeys.includes(f.keyId!)),
   })),
   ```
   Blame: `8609e136b` farai 2026-06-21.

**What it does:** option keys like "Yes", "No" and "Other" are shared by many parents. The cleanup forgot which parent the option was removed from, so it removed it under every parent.

**Introduced:** `8609e136b` farai 2026-06-21.

#### Problem 8: deleting a key leaves dead references in parent keys (high)

**Code:** `master:databases/mutations/data-keys/_delete.ts:175-216` never edits the parent keys' `options`. Blame: `da9883878` KumaloWilson 2026-06-28 "remove fallback matching" (29 lines), `16e114b19` KumaloWilson 2026-06-28.

**What it does:** the dangling reference is what shifts the form's row indexes in #7.

#### Problem 9: option cleanup overwrites drafts with published copies (high)

**Symptom:**
- A delete-with-replacement removes the option instead of replacing it. In release v258, "Toilet" was removed and "Other" never added, across 4 scripts.
- Other users' unpublished screen edits are overwritten.

**Code:** `master:databases/queries/data-keys/_get-refs.ts:50-56`, `70-78`, `92-100` put the "skip rows that have a draft" condition **inside** `or()`:
```ts
or(
    whereUniqueKey(schema.diagnoses.symptoms),
    whereUniqueKey(schema.diagnoses.keyId),
    !diagnosesIds.length ? undefined : notInArray(schema.diagnoses.diagnosisId, diagnosesIds),
),
```
Blame: `8609e136b` farai 2026-06-21, `16e114b19` KumaloWilson 2026-06-28. The published row is then merged over the draft (`master:databases/mutations/scripts/_screens_save.ts:282-297`; blame `4e96f65fb` farai 2024-08-09, `dfa16a206` farai 2026-05-21, `afc8d9624` KumaloWilson 2026-04-27).

**What it does:** the `or` is true for nearly every published row, so both the draft and its published copy come back, and the published copy wins.

#### Problem 10: key cascades are written into other users' drafts (high)

**Symptom:**
- "Publish my changes only" publishes a key change without the screens that use it, so DEV's published state becomes inconsistent.
- Discard can't undo the cascade.

**Code:**
1. **Saving a draft never changes its owner**: `master:databases/mutations/scripts/_screens_save.ts:287-293` (blame `4e96f65fb` farai 2024-08-09, `afc8d9624` KumaloWilson 2026-04-27, `1acb22765` KumaloWilson 2026-08-27).
2. **Publish "mine" filters by owner**: `master:app/actions/ops.ts:1378-1380` (blame `92cd2eeb8` KumaloWilson 2025-11-05).
3. **So does discard**: `master:app/actions/ops.ts:1583-1591` (blame `07a7eaba4` KumaloWilson 2026-07-02).
4. **The cascade saves every entity that merely references a changed key**: `_update_data_keys_refs.ts` (blame `dd3ffba7b` KumaloWilson 2026-03-17).

**Made worse by:** `40f5027cd`, `88d37d4cd`, `68a4f393f` farai 2026-09-22 removed "Publish/Discard everything". Cascade drafts owned by someone else, or by nobody, could then no longer be published or discarded.

#### Problem 11: stale forms overwrite newer options (high)

**Symptom:** options added by an import or another user disappear when someone saves a screen they opened earlier. "First save lost, second save sticks."

**Code:** `master:app/(dashboard)/(scripts)/hooks/use-screen-form.ts:118-124`. The reset is commented out:
```ts
useEffect(() => {
  if (mounted.current) {
    // form.reset(getDefaultValues())
  } else {
    mounted.current = true
  }
}, [formData?.drugs, formData?.feeds, formData?.fluids, form.reset, getDefaultValues])
```
Blame: `abe249f53` KumaloWilson 2025-10-23 "change logs ui done and dusted now testing", `cff4d14f5` farai 2025-12-08 "screens form".

There is no version check on save either (`master:databases/mutations/scripts/_screens_save.ts:279-346`).

#### Problem 12: field dialog "Save" only stages changes, and nothing warns before leaving (medium)

**Code:**
- `master:.../screens/field.tsx:250-257` calls `setValue` with no `shouldDirty`, so the page doesn't know it changed.
- `:306-310` dismissing the dialog resets it.
- Blame: `5f48a2857` KumaloWilson 2025-10-30, `bea3a8777` KumaloWilson 2026-05-07.
- There was no warning before leaving the page anywhere.

#### Problem 13: re-picking the input key on a select screen wipes all options (medium)

**Code:** `master:.../screens/form.tsx:370-376` runs `setValue('items', [])` and `setValue('fields', [])` on **any** key selection, including the same key. Blame: `46e64321c` farai 2025-10-05, `3b7fab94a` farai 2025-04-21.

#### Problem 14: the multi-select picker drops selections hidden by the search (medium)

**Code:**
- `master:components/select-modal.tsx:274-282` resolves picks against the *search-filtered* `options`:
  ```ts
  onSelect?.(
      selectedPending.map(v => options.find(o => o.value === v)!)
          .filter(o => o)
  );
  ```
- `:152-155` resets the pending selection.
- Blame: `908a4bf43` farai 2025-09-28 (8 lines), `1bf187091` KumaloWilson 2026-01-07.

#### Problem 15: integrity "Resolve" / "Bulk resolve" rewrites option N of every same-labelled field (high)

**Code:**
- `master:lib/data-key-integrity.ts:181-190` matches entries by location strings like `"Screen > Plan > option 3"`. Blame: `2b9dadf1f` KumaloWilson 2026-03-17, `b271bffff` KumaloWilson 2026-03-27.
- The same happens at `:1333-1336`. Blame: `2b9dadf1f`.

**Evidence:** 10 "Electronic Signature" fields lost their facility HCW lists.

#### Problem 16: "Publish my changes only" applies other users' queued script deletions (medium)

**Code:** `master:databases/mutations/ops/index.ts:101-126`. The user filter sits inside a ternary:

```ts
where: items === 'scripts' ? and(...) : undefined
```

In the normal call `items` is undefined, so there is **no filter**.

**Blame:** `ad20959c0` farai 2024-10-07 "process pending deletion" (17 lines), `696aeccf4` KumaloWilson 2026-04-01, `78572bc53` farai 2025-09-30, `b568e0961` farai 2026-03-22.

#### Problem 17: search & replace on an option label rewrites the field label (medium)

**Code:** `master:lib/search-replace-payload.ts:191-198` sends `field_item_*` matches down the field branch. Blame: `b7c6a6ba6` KumaloWilson 2026-09-14 "search and replace, bug fix".

### C. Recovery tools that make it worse

#### Problem 18: release rollback soft-deletes keys that existed before (high)

**Code:**
1. Baseline changelog rows are stamped with the current release (`master:databases/mutations/changelogs/_save-change-log.ts:432`; blame `6286ed70d` KumaloWilson 2025-11-28).
2. So pre-existing keys aren't found as targets (`master:databases/mutations/changelogs/_rollback-data-version.ts:62-91`; blame `6286ed70d`, `07d272bd2` KumaloWilson 2026-04-11, `07a7eaba4` 2026-07-02).
3. They are then treated as "created after" and soft-deleted (`:418-430`; blame `07d272bd2`, `ab57237e8` KumaloWilson 2026-01-24, `5010996e8` 2026-04-15).

#### Problem 19: script rollback restores screens to the wrong version (high)

**Code:** `master:databases/mutations/changelogs/_rollback-data-version.ts:248, 297` bound children by `scriptTargetDataVersion`, the release that last touched the script row. Blame: `5010996e8` KumaloWilson 2026-04-15. We observed a rollback to v258 that restored screens as of v225.

#### Problem 20: data-key rollback soft-deletes dependent screens (high)

**Code:** `master:databases/mutations/changelogs/_rollback-change-log.ts:534-565` (`allowSoftDeleteIfCreated: true`). Blame: `afb95fac3` KumaloWilson 2026-04-24.

#### Problem 21: import churn destroys option-level history (medium)

A consequence of #1: new ids on every import mean changelogs can't link the before and after of a screen.

### D. Things that spread or hide the damage

#### Problem 22: tablets are served drafts (high amplifier)

**Code:** `master:app/api/app/device/[deviceId]/route.ts:130-131`:
```ts
const configKeys = await _getConfigKeys({ returnDraftsIfExist: true, });
const scripts = await getScriptsWithItems({ hospitalIds: [hospitalId!], returnDraftsIfExist: true, });
```
Blame: `ab1ea137f` / `7bb53e718` farai 2024-10-20 "app auth JWT". The same is in `master:app/api/(old-api)/sync-data/route.ts:11` (blame `2d4aa0a60` farai 2025-01-14).

#### Problem 23: the drug-library import blocks publishing (high)

**Code:**
- `master:app/actions/remote.ts:270-276` fetches the drug library from **`/api/problems`**.
- `:424-433` passes keys as ids.
- Blame: `a81c3b2d6` farai 2026-09-21 "load remote data".

**What it does:** problem rows are written into LIVE's drug library, and the next publish fails on insert. Users then press "Discard changes", which throws away the imported options too.

#### Problem 24: Export always fails but says "exported successfully" (high)

**Code:**
- `master:app/api/scripts/with-items/route.ts:14` reads `body.data.data` while the caller sends an array. The result is `a is not iterable`. Blame: `1245a9f8b` farai 2025-10-05.
- `master:app/(dashboard)/(scripts)/components/scripts-export-modal.tsx:87-106` shows success as soon as the job is queued. Blame: `0a6e96e3e` farai 2024-08-11, `5cd6d170a` 2024-08-29 and later.

#### Problem 25: the import job cache ignores the checkbox settings for 10 minutes

**Code:** `master:lib/import-jobs.ts:38`, `79-94`. The job's content key leaves out the flags. Blame: `a690b3737` mbaradza 2026-09-23, `8191eee8c` farai 2026-09-29.

#### Problem 26: ownerless drafts, ids and duplicate keys

- **Ownerless drafts.** API-key requests never resolve a user, so drafts get `created_by_user_id = NULL`. This affects drug-library Export, API-key imports and the CLI scripts. After 2026-09-22 (see #10) they couldn't be published or discarded from the UI.
- **Ids.** Normalised item ids were never saved (`master:databases/mutations/scripts/_screens_save.ts:284, 316`).
- **Keys.** Keys deleted on LIVE were recreated by the import, and same-name keys were duplicated (`master:lib/data-keys.ts:315-323`).

### E. Editor bugs found while testing the fix

- **E1. Opening a page counted as an unsaved edit.**
  - The NUID section auto-links its fields with `shouldDirty: true` (`master:.../nuid-search-fields-config.tsx:160, 178`). Blame: `c122983a8` KumaloWilson 2026-08-13, `50603866e` 2026-08-14.
  - Inherited confidentiality compares `undefined !== false` with `shouldDirty: true` (`master:.../screens/form.tsx:216, 222`, and in `field.tsx` / `nuid-search-fields-config.tsx`). Blame: `f74e37502` mbaradza 2026-09-18, `0a66dbae0` KumaloWilson 2026-03-10.
- **E2. Real edits were never detected.**
  - `useMemo(() => !!Object.keys(dirtyFields).length, [dirtyFields])`. React Hook Form mutates `dirtyFields` in place, so the memo never recomputes.
  - `master:.../hooks/use-screen-form.ts:130`, blame `abe249f53` KumaloWilson 2025-10-23. Copied into the script, diagnosis and problem hooks.
- **E3. The users page reloaded forever.**
  - `master:app/(dashboard)/users/components/bulk-edit.tsx:103-105` re-runs `close()` every render, because the parent passes a new array each time, and `close()` always changes the URL (`:63-68`).
  - Blame: `3dccb0eb4` farai 2024-08-08 "upgrade", `f55f85fe3` farai 2025-04-23.
- **E4. Invalid HTML.** A Radix `Switch` (a `<button>`) sits inside another `<button>` (`master:.../screens/form.tsx:962, 979-1003`, plus `field.tsx`, `item.tsx`). Blame: `0a66dbae0` KumaloWilson 2026-03-10, `f74e37502` mbaradza 2026-09-18.

---

## 5. The solutions, problem by problem

Each solution gives:
- **What changed:** files, lines and code.
- **How it solves the problem end to end:** the full path from user action to stored result.
- **Why this way:** the alternatives and why they were rejected.
- **Workflow:** what is better for users.

### 5.1 The import is now a three-way merge (fixes #1, #6, #21)

**What changed:**
- **New table `nt_script_import_sources`** (`manual_migrations/2026-10-21_add_content_sync.sql:14`; schema in `databases/pg/schema.ts`). One row per imported script. It holds the DEV content that LIVE's published script corresponds to (`base_snapshot`), the same for an import still in drafts (`pending_snapshot`), and an **id map** from DEV ids to LIVE ids.
- **New pure merge engine** `lib/import-merge.ts`:

  | Function | Line | What it does |
  |---|---|---|
  | `mergeEntity` | `:210` | Per-property merge, keeping the target's id |
  | `mergeList` | `:278` | Per-list merge |
  | `planEntityMerge` | `:486` | Whole screens, diagnoses and problems |
  | `orderMergedEntities` / `assignMergedPositions` | `:612` / `:640` | Order and positions |
  | `mergeOptionKeys` | `:700` | Data-key option lists |
  | `VOLATILE_KEYS` / `ID_KEYS` / `FILE_KEYS` | `:20` / `:167` / `:49` | Metadata, per-editor ids and file references, which never count as content changes |

- **New plan/apply steps** in `app/actions/scripts.ts`: `planMergeImport` (`:3170`) computes everything without writing, and `applyMergeImport` (`:3410`) writes it as drafts in one transaction.
- **Bookkeeping** in `databases/mutations/scripts/_script_import_sources.ts`:
  - `_recordScriptImport` (`:39`) stores the snapshot (pending if drafts remain).
  - `_settlePendingScriptImports` (`:116`) promotes it on publish (`app/actions/ops.ts:1541`) or clears it on discard (`:1631`).
- **Safety checks:**
  - `getOtherDraftOwners` (`app/actions/scripts.ts:3046`) refuses an import while anyone else, or nobody, has drafts in the target.
  - A source-identity check refuses an import from a different DEV script without explicit confirmation.
  - `IMPORT_ROW_KEYS` (`:2975`) strips per-editor caches so they never count as changes.

The core rule, comparing source and target against the base:

| | DEV changed since base | DEV unchanged |
|---|---|---|
| **LIVE changed** | conflict: DEV wins, reported | keep LIVE |
| **LIVE unchanged** | take DEV | nothing |

**With no base (first import), nothing that exists only on LIVE is ever removed.**

**How it solves the problem end to end:**
1. A user opens Import on a LIVE script. The server loads DEV's published script and LIVE's script with drafts.
2. It finds the base: the snapshot stored by the last import into this LIVE script.
3. It pairs entities by the stored id map, then by identical ids, then by heuristics. It pairs options by `itemId`, then `value`, `id`, `key`.
4. **An option only on LIVE.**
   - Not in the base: it was added on LIVE, so it is kept (`kept_target_only`).
   - In the base and LIVE didn't change it: DEV removed it, so it is removed (`removed_by_source`). This only happens from the second import on.
5. **An option only on DEV.**
   - Not in the base: DEV added it, so it is added.
   - In the base: LIVE deleted it, so it stays deleted.
6. LIVE ids are kept, so history continues and screens aren't recreated (**#21**).
7. Everything is written as drafts, in one transaction, and the import is recorded. On publish, that snapshot becomes the next base.

**Why this way:**
- **"Always replace"** (master) loses LIVE work.
- **"Always add, never remove"** would never apply DEV's deliberate removals, so DEV and LIVE would drift apart forever.
- A **two-way diff** can't tell "LIVE added X" from "DEV removed X": both look like "X only on LIVE".

Only a stored common ancestor answers that question, which is why the base snapshot exists. Keeping LIVE's ids instead of minting new ones is what lets the next import find the same screens again.

**Workflow:** imports into an existing script are now safe to repeat. Re-importing after a small DEV change only applies that change.

### 5.2 Data keys on import (fixes #2, #3, #4, part of #26)

**What changed:** `parseImportedDataKeys` was rewritten (`lib/data-keys.ts:332-674`).
- **Two modes**, chosen by the "Data keys" option in the dialog:
  - "Add what this editor is missing" (`additive`, the new default) adds keys and options and never removes or relabels.
  - "Also apply the source's changes" (`three_way`) applies DEV's changes against the base.
- **Identity** (`:374-394`):
  ```ts
  const sameUniqueKey = localByUniqueKey.get(k.uniqueKey);                     // 1. same uniqueKey
  ...
  const candidates = (localByJSON.get(dataKeyToJSON(k)) || [])                 // 2. exact name/label/type,
      .filter(l => !usedLocal.has(l.uniqueKey) && !importedByUniqueKey.has(l.uniqueKey));
  if (candidates.length === 1) { ... }                                         //    only if unambiguous
  const uniqueKey = takenUniqueKeys.has(k.uniqueKey) ? uuidV4() : (k.uniqueKey || uuidV4()); // 3. new key
  ```
- **Only keys the imported scripts use are saved**: `canSave: k.isReferenced && k.isDifferentFromLocal` (`:541`). "Used" means referenced through `KEY_REFERENCE_PROPS` (`:313`), or being an option of such a key.
- **Option merge** (`mergeImportedOptionKeys`, `:642`). An option DEV removed is kept if questions outside the import use it **under the same key**: `isOptionUsedOutsideImport` (`:478`), backed by `getOptionsUsedOutsideScripts` (`app/actions/scripts.ts:3537`).
- **Confidentiality is never lowered** (`:501`). The final level is the higher of DEV's and LIVE's, with a warning.
- **References are resolved, never silently cleared** (`resolveKeyId`, `:547`).

**How it solves the problem end to end:**
- **#2:** LIVE's own options are no longer filtered out before comparing. With the default mode they're simply kept. With "apply", an option is removed only when the base proves DEV removed it, LIVE didn't re-add it, and no other question uses it under that key. Keys of other scripts are never saved.
- **#3:** existing LIVE keys now receive DEV's new options even in the default mode, so the pickers can offer them.
- **#4:** links are kept by `uniqueKey` and only fall back to name matching when exactly one key fits. An unresolved link produces a warning, never `undefined`.

**Why this way:**
- The default is the mode that **can't** lose anything; the more powerful mode is a deliberate choice, described in plain words in the dialog.
- "Used outside the import, under this key" is the narrowest rule that still protects other scripts. Checking any use under any key would keep options forever, because shared keys like "Yes" are used everywhere.

**Workflow:** the dialog says what each mode does, the default is safe, and the preview lists every key change.

### 5.3 The import reads one consistent state from DEV (fixes #5, #23)

**What changed:**
- Every remote loader sends `returnDraftsIfExist: false, includePendingDeletion: true` (`app/actions/remote.ts:90, 134, 186, 238, 290, 338`).
- `/api/data-keys` reads the JSON `data` parameter (`app/api/data-keys/route.ts`, see `:51`).
- New `includePendingDeletion` option on the data-key, screen, diagnosis, problem, script and drug-library queries.
- Drugs now load from **`/api/drugs-library`** by key (`app/actions/remote.ts:286`).

**How it solves the problem end to end:** every part of DEV (screens, keys, drugs) now comes from DEV's **published** state. A deletion that is only queued on DEV hasn't been published, so it still counts as present. The drug library is fetched from the drug endpoint, so LIVE's next publish no longer fails, and users no longer have a reason to discard imported work.

**Why this way:** an import should copy what DEV actually released. Mixing draft keys with published screens is how options arrived without their screens, and screens without their keys.

### 5.4 Server-side safety checks (fixes #6, #11)

**What changed:**
- **Draft owners** (`getOtherDraftOwners`, `app/actions/scripts.ts:3046`). It looks at drafts and queued deletions in the target script and refuses the import, naming the owners.
- **Source identity.** An import from a different DEV script than last time, or with a different title on a first import, needs explicit confirmation and is then treated as a first import.
- **Stale saves.**
  - `lib/entity-revision.ts:55` computes a content fingerprint (`revision`) of a screen, diagnosis, problem or script.
  - Forms send it back as `baseRevision` (e.g. `use-screen-form.ts:154`).
  - `checkEditorSaveConflicts` (`app/actions/scripts.ts:249`) refuses a save if the stored revision changed or another user owns the draft.
- **Permission.** `isAllowed('import_scripts')` replaces the bare `isAllowed()`.

**How it solves the problem end to end:**
- Nobody's work in progress can be overwritten by an import; the importer is told who has open drafts.
- A form opened before an import, or before another user's save, can no longer save its old option list over the new one. The user gets "changed since you opened it" and the form reloads.

**Why this way:** the UI lock on master only hid buttons. A check on the server is the only thing that also covers background jobs, API calls and older tabs.

### 5.5 Preview, export and job cache (fixes #24, #25)

**What changed:**
- **Dry-run preview, now required before importing.** It's computed by the same `planMergeImport`, so it shows exactly what will be written.
- **Export** (`exportScriptsViaRemoteImport`, `app/actions/scripts.ts:3599`) asks the target editor to run its **own** import from this editor, and waits for the real result.
- **The with-items route** accepts the array it is sent (`app/api/scripts/with-items/route.ts:16`).
- **The job cache key** includes every flag (`buildImportContentKey`, `lib/import-jobs.ts:79`).

**How it solves the problem end to end:**
- **#24:** export now goes through the same safe merge as import, and the dialog shows the real outcome.
- **#25:** changing an option starts a new job instead of reusing the old one's result.

**Why this way:** one import path for both directions means one set of rules to get right, and one set of tests.

### 5.6 Data-key editing, cleanup and cascades (fixes #7, #8, #9, #10)

**What changed:**

1. **Removals are computed at save time** (`app/(dashboard)/data-keys/components/form.tsx:245-252`):
   ```ts
   const baseOptions = currentDataKey?.options || [];
   const removedOptions = baseOptions.filter(o => !finalOptions.includes(o));
   ```
   - Rows are deleted by identity, `filter((o) => o !== child)` (`:761`).
   - A dangling option is shown as "(missing data key)" (`:307`) so indexes can't drift.
   - Saving shows which questions will lose the option.
   - `rebaseDataKeyOptions` (`lib/data-key-save.ts:21`) applies only this edit's own changes if the key changed since the form opened.
2. **Only options that really left the list count** (`reconcileRemovedOptions`, `databases/mutations/data-keys/_save.ts:155`).
3. **Cleanup is scoped to the edited parent** (`databases/mutations/data-keys/_delete-referenced-options.ts`):
   - It takes the parent (`:27`).
   - `ownsQuestion` (`:45`) only touches questions whose own key is that parent.
   - Whole fields are never dropped for an option removal (`:62`).
   - `writable` (`:46`) never rewrites another user's draft.
4. **Draft lookup is fixed** (`databases/queries/data-keys/_get-refs.ts:63, 80, 99, 113`): `NOT EXISTS (a draft with the same id)` inside `and()` instead of `notInArray` inside `or()`.
5. **Deleting a key repairs its parents in the same transaction** (`databases/mutations/data-keys/_delete.ts:233-247`). If the repair fails, nothing is deleted.
6. **The whole data-key save is one transaction** (`_saveDataKeys`, `_save.ts:122`):
   ```ts
   const run = (tx: DbOrTransaction) => saveDataKeysInTransaction(params, tx);
   const response = params.client ? await params.client.transaction(run) : await db.transaction(run);
   ```
7. **An editor save that would touch someone else's draft is refused** (`refuseOthersDrafts`, `_save.ts:147`; messages at `:424` and `:480`):
   ```ts
   if (othersDrafts.length && refuseOthersDrafts) {
       throw new SaveDataKeysRollback({ success: false, errors: [
           `Not saved: this change would also update ... a question that another user is still editing (unpublished): ...` ] });
   }
   ```
   The cascade also only saves entities that actually changed.

**How it solves the problem end to end:**
- **#7.** A user removes "Yes" from the key "Referred from". The form sends only "Yes" as removed, with the parent's uniqueKey. The save confirms "Yes" really left that key, then removes it only from questions whose key is "Referred from". "Yes" under every other key is untouched, and fields are never dropped.
- **#8.** Deleting an option key now also rewrites every parent that listed it, inside the delete's transaction.
- **#9.** The draft lookup now skips published rows that have a draft, so a published copy can no longer overwrite someone's draft.
- **#10.** The user's key edit, its sync into scripts and the option cleanup run in one transaction. If any part would write into another user's (or an ownerless) unpublished draft, the whole save rolls back. The message names the question and the owner. Imports and syncs run by the server still update those drafts, with a warning.

**Why this way:**
- **Propagating a removal to the key's own questions is the intended design, and it is kept.** Only the scope was wrong.
- **Refusing is safer than skipping.** Skipping another user's draft would leave their question with an option the key no longer has, which goes live on their publish. Writing into it causes the half-published state. Refusing, and telling the user who to talk to, is the only option that never leaves the data inconsistent.
- **One transaction** means a failure can't leave half a cascade behind.

**Workflow:** the data-key editor shows exactly which questions change. Edits that would collide with someone's open work are stopped up front with a clear message, instead of corrupting it silently.

### 5.7 Drafts, publish, discard and ownership (fixes #10, #16, #26)

**What changed:**
- **Publish "mine" really means mine.** `databases/mutations/ops/index.ts:59-63` (`wants` / `rowsFor`) always applies both the kind's filter and the user filter.
- **Publishing everyone's drafts** (`scope 1`) is admin-only (`app/actions/ops.ts:1388`).
- **Discard without a user is refused** (`:1588`).
- **Ownerless drafts can be counted and adopted by an admin** (`countOwnerlessDrafts` at `:1672`, plus a top-bar notice), and an ownerless draft becomes the next editor's when they save it.
- **Server-to-server calls carry the real user** via `x-acting-user-email` (`lib/acting-user.ts:5`, honoured in `app/actions/is-authenticated.ts:20`). It is only honoured with a valid API key, and the role is capped at `user`.
- **The CLI scripts must name their user** (`scripts/cli-user.ts`).

**How it solves the problem end to end:** another user's queued deletions are no longer published by "Publish my changes". Drafts created by exports, API calls or the CLI have an owner who can publish or discard them, or an admin can take them over.

**Why this way:** restoring "Publish everything" for everyone would bring back the risk the September 2026 change removed. Giving drafts a real owner, and letting admins adopt ownerless ones, fixes the stuck drafts without that risk.

### 5.8 Rollback (fixes #18, #19, #20)

**What changed:**
- **Release rollback:** new `hadHistoryAtOrBefore` (`databases/mutations/changelogs/_rollback-data-version.ts:99`). An entity is only treated as "created after the target" if it has **no** changelog row at or before it, including baseline rows.
- **Script rollback:** children are bounded by `restoreSourceDataVersion`, the release being restored (`:149`).
- **Data-key rollback:** `allowSoftDeleteIfCreated` defaults to `false` (`_rollback-change-log.ts:281`), and dependants created after the key's target are skipped.

**How it solves the problem end to end:** rolling back a release no longer deletes keys that existed before it, restores screens to the release you chose, and never deletes screens because a key was rolled back.

**Why this way:** a rollback should only undo what that release did. Each fix narrows what a rollback may delete to exactly that.

### 5.9 Tablets and the drug library (fixes #22, #23)

**What changed:**
- **Tablets get published content only.** `app/api/app/device/[deviceId]/route.ts:133-134` (`returnDraftsIfExist: false`, `includePendingDeletion: true`), and the same in the old sync route.
- **Change detection ignores drafts** (`:114`, `publishedOnly: true`).
- **Imported drug items** no longer carry DEV's serial id.

**How it solves the problem end to end:** a draft, including a damaged one, never reaches a device. Tablets update only when something is published.

### 5.10 Editor forms (fixes #11, #12, #13, #14, #15, #17, E1–E4)

**What changed, and why:**
- **#11 / E2: forms show the latest saved version** (`use-screen-form.ts:128-146`, and the same pattern in the script, diagnosis and problem hooks):
  ```ts
  const formIsDirty = Object.keys(dirtyFields).length > 0          // E2: recomputed on every render
  const loadedRevision = useRef(formData?.revision)
  useEffect(() => {
    ...
    if (!formData?.revision || formData.revision === loadedRevision.current) return
    if (formIsDirty) return                                           // never overwrite unsaved edits
    loadedRevision.current = formData.revision
    form.reset(getDefaultValues())
  }, [...])
  ```
  The form reloads when the stored entity changes, unless you have edits. If you do, the server-side revision check (§5.4) stops a stale save.
- **#12: dialog edits mark the page as changed, and leaving asks first.**
  - `shouldDirty: true` is added in the field, option and symptom editors.
  - `hooks/use-unsaved-changes-guard.ts:20` uses the app's confirm dialog for in-app links and returns `confirmLeave` for Cancel buttons (`:80`). Links inside menus close the menu first (`:56`).
  - Closing a field, option or symptom editor with changes asks "Discard changes?".
- **#13: re-picking the screen key** (`screens/form.tsx:373-393`). The same key keeps the options; a different key asks first and says how many items and fields will go.
- **#14: picker** (`components/select-modal.tsx`). It resolves picks against all options (`optionsProp`), keeps selected values that aren't in the list, and doesn't reset while open.
- **#15: integrity repairs** (`lib/data-key-integrity.ts:181-197`). They match by field, item and symptom ids too, and a repair matching more than one question changes nothing and says why.
- **#17: search & replace** (`lib/search-replace-payload.ts:33-43`). Option matches become per-option patches; only the option label changes.
- **E1: opening a page is not an edit.** The NUID auto-link runs in the background without marking the form changed (`nuid-search-fields-config.tsx:162, 180`). Inherited confidentiality compares `!!value` and uses `shouldDirty: false`.
- **E3: users page** (`bulk-edit.tsx:52-70`). The effect depends on "has selection", and the URL is only changed when there is a `bulkEdit` parameter to remove.
- **E4: nested buttons.** The outer wrapper is a `div` with `role="button"` (`screens/form.tsx:994, 1037`, plus `field.tsx`, `item.tsx`).

**Workflow:**
- Forms never silently save old content.
- Leaving with unsaved edits always asks, in the app's own dialog.
- Opening a page never asks for no reason.

---

## 6. New safeguards that go beyond the original problems

These weren't needed to stop the losses above, but they close the ways the same kind of loss could come back.

### 6.1 Every import is all or nothing

**What changed:**
- The data-key save and the drug-library saves accept a transaction.
- `copyScripts` runs the script changes, drugs, data keys and the import record in one transaction (`saveLibraries`, `app/actions/scripts.ts:3949`; `ImportRolledBack`, `:217`).

**Why:** on master, data keys were saved after the screens, so a failure left screens pointing at options their key didn't have. Now a failure leaves nothing behind. We checked this with a database trigger that forces the key save to fail: no drafts were left and the import record was unchanged.

### 6.2 The browser can't pretend to be an import

**What changed:** `lib/server/internal-call.ts` uses Node's `AsyncLocalStorage` to know when the server itself is running an import.
```ts
export function trustedDraftOrigin(draftOrigin, session) {
    if (!draftOrigin || draftOrigin === "editor") return draftOrigin || undefined;
    return (isInternalCall() || session?.viaApiKey) ? draftOrigin : "editor";
}
```
`copyScripts` runs inside `runAsInternalCall` (`app/actions/scripts.ts:3676`). Every script and data-key save action passes its `draftOrigin` through this helper, and the content-sync lock checks it too.

**Why:** server actions can be called straight from a browser, so a request could claim `draftOrigin: 'import'` and skip the lock and the stale-save check. Now that claim only counts for imports the server runs itself, or for the other editor's API key.

### 6.3 A preview never writes

`resolveScriptImportBase` (`app/actions/scripts.ts:3086`) works out a stale import record in memory during a preview (`persist: !dryRun`, `:3857`).

### 6.4 The preview lists what a first import replaces

A new merge event, `replaced_without_history` (`lib/import-merge.ts:86, 267`). On a first import, every LIVE value that differs from DEV and will take DEV's version is listed in the preview ("Needs a look").

### 6.5 Content sync: stopping the drift that caused all this

**Off by default** (Settings → Content Sync):
- DEV is set as the **source** and LIVE as the **target**.
- On LIVE, scripts, data keys and drugs can be locked so changes are made on DEV.
- An admin can open a per-script **hotfix**, with a reason; it is audit-logged.
- Every script shows whether it matches its counterpart:

| Component | Where |
|---|---|
| Settings and lock rule | `lib/content-sync.ts:59`, `getContentLockReason` `:104` |
| Server lock | `assertContentEditable`, `lib/server/content-sync.ts:61` |
| Portable fingerprint | `lib/content-sync-fingerprint.ts:104`, version `v1` |
| Status per script | `computeContentSyncPairs`, `lib/content-sync.ts:202`; newest link wins at `:239` |

**Why per script:** DEV publishes far more often than LIVE, so editor-wide data versions always differ. Each script is compared only with its counterpart, by content fingerprint.

### 6.6 The import dialog

The dialog was rebuilt from the portal's own components (`Title` sections, the standard data table, plain radio rows, changelog badge colours) as **Source → Review → Import**:
- **Source:** a searchable list of the other editor's scripts (`import-source-picker.tsx`, via `getImportSources`, `app/actions/scripts.ts:4488`) replaces the free-text "Script ID" box (#6), with the usual source pre-selected.
- **Review:** the preview, with removals, conflicts and the source check called out first. The confirmation sits next to the button.
- **Progress and results:** shown inside the dialog, with errors and "Try again" there too.

---

## 7. Problem → fix map

| # | Problem | Introduced | Fixed in |
|---|---|---|---|
| 1 | Import replaces the whole script | `0c6f3bdd5` farai 2024-08-11 | §5.1 |
| 2 | Overwrite datakeys replaces option lists | `24547a24e` farai 2025-10-08; default `943ef8ec3` 2025-10-10 | §5.2 |
| 3 | Box off: keys stale, pickers hide options | `908a4bf43` farai 2025-09-28 | §5.2, §5.10 |
| 4 | Key links guessed | `24547a24e` farai 2025-10-08 | §5.2 |
| 5 | Published/draft/pending mix-up | `c6a70de2c` 2024-08-11; `061765d67` KumaloWilson 2026-05-13; `a81c3b2d6` farai 2026-09-21 | §5.3 |
| 6 | No server-side guards | `a239ef763` farai 2025-09-30 (UI-only lock) | §5.4, §6.6 |
| 7 | Option row delete hits every script | `8609e136b` farai 2026-06-21 | §5.6 |
| 8 | Dead parent references on key delete | `da9883878` KumaloWilson 2026-06-28 | §5.6 |
| 9 | Cleanup overwrites drafts | `8609e136b` farai 2026-06-21 | §5.6 |
| 10 | Cascades into others' drafts | `dd3ffba7b` KumaloWilson 2026-03-17; worsened 2026-09-22 | §5.6, §5.7 |
| 11 | Stale forms | `abe249f53` KumaloWilson 2025-10-23 | §5.4, §5.10 |
| 12 | No unsaved-changes guard | `5f48a2857` KumaloWilson 2025-10-30 | §5.10 |
| 13 | Re-picking key wipes options | `46e64321c` farai 2025-10-05 | §5.10 |
| 14 | Picker drops hidden picks | `908a4bf43` farai 2025-09-28 | §5.10 |
| 15 | Integrity bulk resolve | `2b9dadf1f` KumaloWilson 2026-03-17 | §5.10 |
| 16 | Publish mine applies others' deletions | `ad20959c0` farai 2024-10-07 | §5.7 |
| 17 | Search & replace on option label | `b7c6a6ba6` KumaloWilson 2026-09-14 | §5.10 |
| 18 | Release rollback deletes old keys | `6286ed70d` KumaloWilson 2025-11-28 | §5.8 |
| 19 | Script rollback wrong version | `5010996e8` KumaloWilson 2026-04-15 | §5.8 |
| 20 | Data-key rollback deletes screens | `afb95fac3` KumaloWilson 2026-04-24 | §5.8 |
| 21 | Import destroys history | consequence of #1 | §5.1 |
| 22 | Tablets get drafts | `7bb53e718` farai 2024-10-20 | §5.9 |
| 23 | Drug import blocks publish | `a81c3b2d6` farai 2026-09-21 | §5.3, §5.9 |
| 24 | Export fails, says success | `1245a9f8b` farai 2025-10-05; job flow `a690b3737` 2026-09-23 | §5.5 |
| 25 | Job cache ignores flags | `a690b3737` mbaradza 2026-09-23 | §5.5 |
| 26 | Ownerless drafts, ids, duplicates | API-key drafts; stuck since 2026-09-22 | §5.2, §5.4, §5.7 |
| E1 | Opening a page = edit | `c122983a8` 2026-08-13; `f74e37502` 2026-09-18 | §5.10 |
| E2 | Edits not detected | `abe249f53` KumaloWilson 2025-10-23 | §5.10 |
| E3 | Users page loop | `3dccb0eb4` farai 2024-08-08 | §5.10 |
| E4 | Nested buttons | `0a66dbae0` 2026-03-10; `f74e37502` 2026-09-18 | §5.10 |

---

## 8. What users will notice

**Imports:**
- Imports into an existing script **merge** instead of replacing, and land as drafts.
- A **preview is required** first.
- The source is chosen from a list, with the usual source pre-selected.
- "Data keys: add what this editor is missing" is the default.
- On a first import, LIVE-only screens and options are kept.
- An import is refused while someone else has unpublished changes in that script; the message names them.
- A different source than last time needs confirmation.

**Export:** creates new draft copies on LIVE, owned by the exporter, and reports the real result.

**Editing:**
- Saving something that changed since you opened it is refused.
- Leaving with unsaved edits asks first, and opening a page no longer counts as an edit.
- Removing an option from a key shows which questions lose it, and only that key's questions change.
- **On DEV, a data-key edit is refused while another user has unpublished changes in a question using that key.** They publish or discard first, or an admin adopts ownerless drafts.

**Publishing and devices:** "Publish everyone's changes" is admin-only, and tablets receive published content only.

**Content sync:** nothing changes until a super user turns it on.

---

## 9. How it was verified

**Unit tests**
- New files:
  - `tests/import-merge.test.ts`
  - `tests/import-option-loss-fixes.test.ts`
  - `tests/content-sync.test.ts`
  - `tests/internal-call.test.ts`
- All 33 test files in `npm test` pass, and `tsc` is clean.

**Two-editor simulation**
- **Setup:** DEV on `:8721` and LIVE on `:8722`, both built from this branch, each on a fresh copy of full DEV and LIVE databases.

| Check | Result |
|---|---|
| Import matrix: overwrite on and off, 2 rounds each; new copy then re-import; shared option removal; drugs; multi-script; rollback after import | **54/54**, 0 options lost that DEV hadn't removed; other scripts unchanged (11,694 and 11,519 options before and after) |
| Follow-up checks: refusals over others' drafts, all-or-nothing import and key delete (forced failure via DB trigger), preview never writes, per-key option use, lock bypass refused, status cache, first-import listing | **43/43** |
| Browser: 129 pages open with no false "unsaved changes"; guard Stay/Leave; Cancel; discard dialogs; picker hint | **12/12**, **12/12** |
| Browser: new import dialog (into a script, wrong source, several new copies) | **25/25** |
| Content-sync UI | **15/15** |

---

## 10. Deploying

1. **Run the migration on both editors before deploying:** `manual_migrations/2026-10-21_add_content_sync.sql`. It is idempotent.
2. **Deploy DEV and LIVE together**, since both need the new routes and the `?data=` handling.
3. **Make sure each user who exports has an account on the target.**
4. **The first import of each script after deploy is a first import.** It removes nothing, so it can't undo the manual restoration. Merging starts with the second import.
5. **Optionally turn on content sync:** DEV as source linked to LIVE, LIVE as target linked to DEV.
