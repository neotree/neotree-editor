import { scriptsServerActions } from "@/contexts/scripts/server-actions";
import { ScriptsContextProvider } from "@/contexts/scripts";

type Props = {
    children: React.ReactNode;
};

export default async function ScriptsLayout({ children }: Props) {
    const [hospitals] = await Promise.all([
        scriptsServerActions._getHospitals({}),
    ]);

    return (
        <ScriptsContextProvider 
            hospitals={hospitals.data}
            {...scriptsServerActions}
        >
            {children}
        </ScriptsContextProvider>
    )
}
