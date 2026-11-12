import { Title } from "@/components/title";
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { _listDataKeyMerges, _listDuplicateDismissals } from "@/databases/queries/data-keys";
import { MergeOverview } from "../components/merge/merge-overview";
import { MergeWorkspace } from "../components/merge/merge-workspace";

export const dynamic = 'force-dynamic';

export default async function DataKeysMergePage(props: { searchParams: Promise<{ ids?: string | string[]; }>; }) {
    const [{ isSuperUser }, searchParams] = await Promise.all([
        getAuthenticatedUserWithRoles(),
        props.searchParams,
    ]);

    const rawIds = Array.isArray(searchParams.ids) ? searchParams.ids.join(',') : (searchParams.ids || '');
    const ids = Array.from(new Set(rawIds.split(',').map((id) => id.trim()).filter(Boolean)));

    if (ids.length) {
        return (
            <>
                <Title>Merge data keys</Title>
                <MergeWorkspace key={ids.join(',')} ids={ids} canMerge={isSuperUser} />
            </>
        );
    }

    const [dismissals, merges] = await Promise.all([
        _listDuplicateDismissals(),
        _listDataKeyMerges(),
    ]);

    return (
        <>
            <Title>Harmonise data keys</Title>
            <MergeOverview
                canMerge={isSuperUser}
                dismissals={dismissals.data}
                merges={merges.data}
            />
        </>
    );
}
