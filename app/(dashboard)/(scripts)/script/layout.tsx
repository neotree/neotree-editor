import { DataKeysCtxProvider } from '@/contexts/data-keys';

export default function ScriptLayout({ children, }: {
    children: React.ReactNode;
}) {
    return (
        <DataKeysCtxProvider prefetchSelectOptions>
            {children}
        </DataKeysCtxProvider>
    );
}
