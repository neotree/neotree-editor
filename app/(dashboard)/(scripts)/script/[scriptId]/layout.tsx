import { getHospitals } from "@/app/actions/hospitals";
import { getScript, getScriptsConditionKeys } from "@/app/actions/scripts";
import { Alert } from "@/components/alert";
import { ScriptFormCtxProvider } from "@/contexts/script-form";

type ScriptPageLayoutProps = {
    children: React.ReactNode;
    params: { scriptId: string; };
};

export default async function ScriptPageLayout({ children, params: { scriptId, } }: ScriptPageLayoutProps) {
    const [{ data: formData }] = await Promise.all([
        getScript({ scriptId, returnDraftIfExists: true, }),
    ]);

    if (!formData) {
        return (
            <Alert 
                title="Not found"
                message="Script was not found or it might have been deleted!"
                redirectTo="/"
            />
        );
    }

    const [
        hospitals,
        conditionKeys,
    ] = await Promise.all([
        getHospitals(),
        getScriptsConditionKeys([scriptId])
    ]);

    return (
        <ScriptFormCtxProvider
            conditionKeys={conditionKeys.data}
            hospitals={hospitals.data}
            formData={formData}
        >
            {children}
        </ScriptFormCtxProvider>
    );
}
