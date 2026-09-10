import { getHospitals } from "@/app/actions/hospitals";
import { ScriptFormCtxProvider } from "@/contexts/script-form";

type NewScriptPageLayoutProps = {
    children: React.ReactNode;
};

export default async function NewScriptPageLayout({ children, }: NewScriptPageLayoutProps) {
    const [
        hospitals,
    ] = await Promise.all([
        getHospitals(),
    ]);

    return (
        <ScriptFormCtxProvider
            hospitals={hospitals.data}
        >
            {children}
        </ScriptFormCtxProvider>
    );
}
