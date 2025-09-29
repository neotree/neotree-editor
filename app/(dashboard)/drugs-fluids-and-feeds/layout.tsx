import { DataKeysCtxProvider } from '@/contexts/data-keys';

export default async function DffLayout({ children }: {
    children: React.ReactNode;
}) {

    return (
        <>
            <DataKeysCtxProvider>
                {children}
            </DataKeysCtxProvider>
        </>
    );
}
