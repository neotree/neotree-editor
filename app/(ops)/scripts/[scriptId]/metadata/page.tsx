import { getScriptsMetadata } from "@/app/actions/scripts";
import { ScriptMetaActions } from './components/actions';
import { JsonViewer } from "./components/json-viewer";

type Props = {
    params: Promise<{
        scriptId: string;
    }>,
};

export const dynamic = 'force-dynamic';

export default async function OpsScripyPage(props: Props) {
    const params = await props.params;

    const {
        scriptId
    } = params;

    const [scriptsMeta] = await Promise.all([
        getScriptsMetadata({ scriptsIds: [scriptId], returnDraftsIfExist: true, }),
    ]);

    if (scriptsMeta.errors) return <h1 className="text-lg text-danger">{scriptsMeta.errors.join(', ')}</h1>;

    const metadataData = scriptsMeta.data.map((s) => {
        return {
            ...s,
            screens: s.screens.map((screen, screenIndex) => {
                return {
                    ...screen,
                    position: screenIndex + 1,
                };
            }),
        };
    });

    return (
        <>
            <JsonViewer data={metadataData} />

            <ScriptMetaActions data={scriptsMeta.data} />
        </>
    );
}
