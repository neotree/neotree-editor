import { ScriptFhirActions } from "./components/actions";

type Props = {
    params: {
        scriptId: string;
    };
};

export const dynamic = "force-dynamic";

export default async function ScriptFhirQuestionnairePage({ params: { scriptId } }: Props) {
    const dataRes = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/scripts/${scriptId}/fhir-questionnaire.json?imageMode=url`,
        { cache: "no-store" }
    ).catch(() => null);

    let data: any = null;
    let errorText = "";

    if (!dataRes || !dataRes.ok) {
        errorText = dataRes ? await dataRes.text() : "Failed to reach the FHIR JSON endpoint.";
    } else {
        data = await dataRes.json();
    }

    return (
        <>
            <pre>
                {errorText ? errorText : JSON.stringify(data, null, 4)}
            </pre>
            <ScriptFhirActions scriptId={scriptId} />
        </>
    );
}
