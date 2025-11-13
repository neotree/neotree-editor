import { getDrugsLibraryMetadata } from "@/app/actions/drugs-library";
import { DrugsLibraryMetaActions } from "./components/actions";

type Props = {
    params: {
        itemId: string;
    };
};

export const dynamic = 'force-dynamic';

export default async function DrugsLibraryMetadataPage({ params: { itemId } }: Props) {
    const metadata = await getDrugsLibraryMetadata({
        itemsIds: [itemId],
        returnDraftsIfExist: true,
    });

    if (metadata.errors?.length) {
        return <h1 className="text-lg text-danger">{metadata.errors.join(', ')}</h1>;
    }

    if (!metadata.data.length) {
        return <h1 className="text-lg">No metadata found for this item.</h1>;
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
