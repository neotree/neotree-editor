'use client';

import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Pickers only offer the options of the parent data key (the screen's or the field's key), so an option
 * that is missing there can't be picked. Say so, and link to the key so the option can be added to it.
 */
export function ParentKeyOptionsHint({
    dataKey,
    owner,
    className,
}: {
    dataKey: { uniqueKey?: string | null; label?: string | null; name?: string | null; };
    /** Whose key it is: "screen" or "field". */
    owner: "screen" | "field";
    className?: string;
}) {
    const name = dataKey.label || dataKey.name || dataKey.uniqueKey || "";
    return (
        <p className={cn("text-xs text-muted-foreground", className)}>
            Only options of the {owner}&apos;s data key &quot;{name}&quot; are listed. To use another option, add it to that
            key first{dataKey.uniqueKey ? (
                <>
                    {" "}(
                    <Link
                        href={`/data-keys/edit/${dataKey.uniqueKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        open &quot;{name}&quot; in the Data keys library
                    </Link>
                    ), then pick it here.
                </>
            ) : " in the Data keys library."}
        </p>
    );
}

/**
 * An existing option's data key is locked: swapping it in place would change what a saved answer means
 * while every condition that names the old value stays behind. Say so, and point to the ways that do it safely.
 */
export function LockedOptionKeyHint({ className }: { className?: string; }) {
    return (
        <p className={cn("text-xs text-muted-foreground", className)}>
            The data key of an existing option can&apos;t be changed here. To use another key, delete this option and add
            the other one, or replace or merge the key from the{" "}
            <Link href="/data-keys" target="_blank" rel="noopener noreferrer" className="underline">
                Data keys library
            </Link>
            , which also updates the conditions that use it.
        </p>
    );
}
