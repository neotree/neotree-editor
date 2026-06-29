import { Alert } from "@/components/alert";
import { DataKeyIntegrityRulesReference } from "@/components/data-key-integrity-rules-reference";
import { Title } from "@/components/title";
import { getScriptsWithItems } from "@/app/actions/scripts";
import { PageContainer } from "../../../../components/page-container";

type Props = {
    params: { scriptId: string; };
};

export default async function ScriptDataKeyValidationRules({ params }: Props) {
    const { scriptId } = await params;
    const { data: scripts } = await getScriptsWithItems({
        scriptsIds: [scriptId],
    });
    const script = scripts[0];

    if (!script) {
        return (
            <Alert
                title="Error"
                message="Script not found"
                variant="error"
            />
        );
    }

    return (
        <>
            <Title>Data Key Validation Rules</Title>
            <PageContainer
                title="Data key validation rules"
                backLink={`/script/${scriptId}/data-keys`}
            >
                <div className="p-4">
                    <DataKeyIntegrityRulesReference scriptTitle={script.title} />
                </div>
            </PageContainer>
        </>
    );
}
