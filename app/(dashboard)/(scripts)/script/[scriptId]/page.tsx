'use client';

import { Title } from "@/components/title";
import { EntityHistoryButton } from "@/app/(dashboard)/components/entity-history";
import { ScriptForm } from "../../components/script-form";
import { PageContainer } from "../../components/page-container";
import { useScriptFormCtx } from "@/contexts/script-form";

// export const dynamic = 'force-dynamic';

export default async function ScriptEditPage() {
    const { formData: fd, } = useScriptFormCtx();
    const formData = fd!;
    
    return (
        <>
            <Title>{'Edit script - ' + formData?.title}</Title>

            <PageContainer
                title="Edit script"
                backLink="/"
                actions={(
                    <EntityHistoryButton 
                        entityType="script" 
                        entityId={formData.scriptId!} 
                        entityName={formData.title} 
                    />
                )}
            >
                <ScriptForm />
            </PageContainer>
        </>
    )
}
