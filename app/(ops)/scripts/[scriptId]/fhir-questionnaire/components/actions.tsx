'use client';

import { useCallback, useRef } from "react";

import { Button } from "@/components/ui/button";

export function ScriptFhirActions({ scriptId }: { scriptId: string }) {
    const downloadJSONRef = useRef<HTMLAnchorElement>(null);

    const downloadJSON = useCallback(async () => {
        const url = `/scripts/${scriptId}/fhir-questionnaire.json?download=1&imageMode=url`;
        downloadJSONRef.current?.setAttribute?.("href", url);
        downloadJSONRef.current?.setAttribute?.("download", `fhir-questionnaire-${scriptId}.json`);
        downloadJSONRef.current?.click?.();
    }, [scriptId]);

    return (
        <>
            <a
                href="#"
                target="_blank"
                className="h-0 w-0 absolute overflow-hidden"
                ref={downloadJSONRef}
            />

            <div className="h-[100px]" />

            <div
                className="
                    fixed
                    bottom-0
                    left-0
                    w-full
                    h-[80px]
                    border-t
                    border-t-border
                    bg-white
                    flex
                    items-center
                    justify-end
                    px-4
                    gap-x-4
                "
            >
                <Button onClick={downloadJSON}>
                    Download JSON
                </Button>

                <Button asChild variant="outline">
                    <a
                        href="https://lhcfhirtools.nlm.nih.gov/sdc"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Test in LHC Forms
                    </a>
                </Button>
            </div>
        </>
    );
}
