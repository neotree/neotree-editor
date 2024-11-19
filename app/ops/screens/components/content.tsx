'use client';

import { Header } from "./header";

type ContentProps = {
    columns: string[];
};

export function Content({
    columns,
}: ContentProps) {
    return (
        <>
            <Header columns={columns} />
        </>
    );
}
