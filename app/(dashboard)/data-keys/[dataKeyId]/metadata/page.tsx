import { getDataKeys } from "@/app/actions/data-keys";
import { DataKeysMetaActions } from "../../metadata/components/actions";
import { getDataKeysWithUsage } from "../../metadata/get-data-keys-with-usage";

export const dynamic = 'force-dynamic';

type Props = {
    params: {
        dataKeyId: string;
    };
};

export default async function DataKeyMetadataPage({ params: { dataKeyId } }: Props) {
    const metadata = await getDataKeys({
        dataKeysIds: [dataKeyId],
        returnDraftsIfExist: true,
    });

    if (metadata.errors?.length) {
        return <h1 className="text-lg text-danger">{metadata.errors.join(', ')}</h1>;
    }

    if (!metadata.data.length) {
        return <h1 className="text-lg">No metadata found for this data key.</h1>;
    }

    const metadataWithUsage = await getDataKeysWithUsage(metadata.data);

    return (
        <>
            <pre>
                {JSON.stringify(metadataWithUsage, null, 4)}
            </pre>

            <DataKeysMetaActions data={metadataWithUsage} />
        </>
    );
}

