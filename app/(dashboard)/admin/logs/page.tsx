import { getLogs } from "@/app/actions/logs";
import { Title } from "@/components/title";
import { Content } from "./components/content";

export default async function AdminLogsPage() {
    const _getLogs: typeof getLogs = async (...params) => {
        'use server';
        return getLogs(...params);
    };

    return (
        <>
            <Title>Logs</Title>

            <Content 
                _getLogs={_getLogs}
            />
        </>
    );
}
