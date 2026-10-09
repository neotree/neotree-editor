import * as React from "react";

import { _getDataKeys } from "@/databases/queries/data-keys";

/**
 * The data key registry, loaded at most once per server request.
 *
 * Rendering a script page used to load the whole registry twice: once in the
 * scripts group layout to seed the data-keys context, and again inside
 * `getScriptsConditionKeys` to resolve the condition-key catalogue. Both asked
 * for the same thing — `returnDraftsIfExist` already defaults to true — so the
 * second load was ~113ms of duplicated work on every script page load, which is
 * most of that call's remaining cost now that scrapping itself is linear.
 *
 * Read paths only. Anything that reads the registry *after* writing to it in the
 * same request — the recompute and save paths — must keep calling `_getDataKeys`
 * directly, or it would be handed the pre-write snapshot.
 */

type RegistryLoader = () => Promise<Awaited<ReturnType<typeof _getDataKeys>>>;

/**
 * React only exports `cache` under its server condition, which Next's App
 * Router supplies. The tsx CLI scripts resolve the client build, where it is
 * absent, so fall through to calling the loader directly there — those runs
 * read the registry once anyway, and crashing on a missing export would be a
 * far worse trade than not deduping.
 */
export function requestScoped(
  loader: RegistryLoader,
  cacheImpl: ((fn: RegistryLoader) => RegistryLoader) | undefined =
    (React as { cache?: (fn: RegistryLoader) => RegistryLoader }).cache,
): RegistryLoader {
  return typeof cacheImpl === "function" ? cacheImpl(loader) : loader;
}

export const getConditionKeyRegistry = requestScoped(async () => _getDataKeys({ returnDraftsIfExist: true }));
