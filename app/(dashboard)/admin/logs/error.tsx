'use client';

import { Title } from "@/components/title";

export default async function AdminLogsErrorPage(props: any) {
    return (
        <>
            <Title>Logs ERROR</Title>

            <div>{JSON.stringify(props)}</div>
        </>
    );
}
