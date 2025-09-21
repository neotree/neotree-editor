import { DataKeysCtxProvider } from '@/contexts/data-keys';

export default function DataKeysLayout({ children, }: {
    children: React.ReactNode;
}) {
    return (
        <DataKeysCtxProvider>
            {children}
        </DataKeysCtxProvider>
    );
}
