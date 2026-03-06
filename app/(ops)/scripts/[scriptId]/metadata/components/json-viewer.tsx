'use client';

import { useState } from "react";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type Props = {
    data: JsonValue;
};

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toJsonPrimitive(value: JsonPrimitive) {
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value === 'number' || typeof value === 'boolean') return `${value}`;
    return 'null';
}

function JsonLine({
    value,
    depth = 0,
    keyName,
    isLast = true,
}: {
    value: JsonValue;
    depth?: number;
    keyName?: string;
    isLast?: boolean;
}) {
    const indent = '  '.repeat(depth);
    const keyPrefix = typeof keyName === 'string' ? `${JSON.stringify(keyName)}: ` : '';
    const comma = isLast ? '' : ',';

    if (!Array.isArray(value) && !isObject(value)) {
        return <div>{indent}{keyPrefix}{toJsonPrimitive(value)}{comma}</div>;
    }

    const isArray = Array.isArray(value);
    const openToken = isArray ? '[' : '{';
    const closeToken = isArray ? ']' : '}';
    const entries = isArray
        ? value.map((item, index) => [String(index), item] as const)
        : Object.entries(value);

    if (!entries.length) return <div>{indent}{keyPrefix}{openToken}{closeToken}{comma}</div>;

    return (
        <CompositeJsonLine
            depth={depth}
            keyPrefix={keyPrefix}
            comma={comma}
            isArray={isArray}
            openToken={openToken}
            closeToken={closeToken}
            entries={entries}
        />
    );
}

function CompositeJsonLine({
    depth,
    keyPrefix,
    comma,
    isArray,
    openToken,
    closeToken,
    entries,
}: {
    depth: number;
    keyPrefix: string;
    comma: string;
    isArray: boolean;
    openToken: string;
    closeToken: string;
    entries: ReadonlyArray<readonly [string, JsonValue]>;
}) {
    const indent = '  '.repeat(depth);
    const [open, setOpen] = useState(true);

    return (
        <>
            <div
                className="cursor-pointer select-none"
                onClick={() => setOpen(prev => !prev)}
            >
                {indent}{open ? '▼' : '▶'} {keyPrefix}
                {open ? openToken : `${openToken}...${closeToken}`}{comma}
            </div>

            {open && (
                <>
                    {entries.map(([entryKey, entryValue], index) => (
                        <JsonLine
                            key={`${entryKey}.${index}`}
                            value={entryValue}
                            depth={depth + 1}
                            keyName={isArray ? undefined : entryKey}
                            isLast={index === entries.length - 1}
                        />
                    ))}
                    <div>{indent}{closeToken}{comma}</div>
                </>
            )}
        </>
    );
}

export function JsonViewer({ data }: Props) {
    return (
        <pre className="font-mono text-sm whitespace-pre-wrap">
            <JsonLine value={data} />
        </pre>
    );
}
