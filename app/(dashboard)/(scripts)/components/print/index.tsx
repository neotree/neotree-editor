import { useEffect, useRef } from "react";

import { useScriptsContext } from "@/contexts/scripts";
import { Loader } from "@/components/loader";
import { PrintSections } from "./print-sections";
import { useScriptForm } from "../../hooks/use-script-form";
import { Title } from "../title";
import { ScriptPrintConfig } from "./print-config";

type Props = {
    disabled?: boolean;
    form: ReturnType<typeof useScriptForm>;
};

export function ScriptPrintSetup(props: Props) {
    const mounted = useRef(false);
    const { keysLoading, screensLoading, loadScreens, loadKeys, } = useScriptsContext();

    useEffect(() => {
        if (!mounted.current) {
            loadScreens();
            loadKeys();
        }
    }, [loadScreens, loadKeys]);

    if (keysLoading || screensLoading) return <Loader overlay />;

    return (
        <>
            {/* Print sections */}
            <Title className="px-4">Print sections</Title>

            <PrintSections {...props} />

            {/* Print config */}
            <Title className="px-4">Print config</Title>

            <ScriptPrintConfig {...props} />
        </>
    );
}
