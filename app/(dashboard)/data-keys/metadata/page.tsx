import { getDataKeys } from "@/app/actions/data-keys";
import { DataKeysMetaActions } from "./components/actions";

export const dynamic = 'force-dynamic';

export default async function DataKeysMetadataPage() {
    const metadata = await getDataKeys({
        returnDraftsIfExist: true,
    });

    if (metadata.errors?.length) {
        return <h1 className="text-lg text-danger">{metadata.errors.join(', ')}</h1>;
    }

    if (!metadata.data.length) {
        return <h1 className="text-lg">No metadata found.</h1>;
    }

    return (
        <>
            <pre>
                {JSON.stringify(metadata.data, null, 4)}
            </pre>

            <DataKeysMetaActions data={metadata.data} />
        </>
    );
}

