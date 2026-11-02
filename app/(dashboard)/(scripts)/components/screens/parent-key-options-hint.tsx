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
