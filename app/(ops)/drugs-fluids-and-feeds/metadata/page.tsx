import { getDrugsLibraryMetadata } from "@/app/actions/drugs-library";
import { DrugsLibraryMetaActions } from "../[itemId]/metadata/components/actions";

export const dynamic = 'force-dynamic';

export default async function DrugsFluidsAndFeedsMetadataPage() {
    const metadata = await getDrugsLibraryMetadata({
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

            <DrugsLibraryMetaActions data={metadata.data} />
        </>
    );
}
