import { notFound } from "next/navigation";

import { Title } from "@/components/title";
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { _getDataKeyMerge } from "@/databases/queries/data-keys";
import { MergeDetail } from "../../../components/merge/merge-detail";

export const dynamic = 'force-dynamic';

export default async function DataKeyMergeDetailPage(props: {
    params: Promise<{ mergeId: string; }>;
    searchParams: Promise<{ merged?: string; }>;
}) {
    const [{ isSuperUser }, params, searchParams] = await Promise.all([
        getAuthenticatedUserWithRoles(),
        props.params,
        props.searchParams,
    ]);

    const { data, errors } = await _getDataKeyMerge(params.mergeId);
    if (errors?.length) throw new Error(errors[0]);
    if (!data) notFound();

    return (
        <>
            <Title>Merge report</Title>
            <MergeDetail merge={data} canMerge={isSuperUser} justMerged={searchParams.merged === '1'} />
        </>
    );
}
