import { Title } from "@/components/title";
import { getAuthenticatedUserWithRoles } from "@/app/actions/get-authenticated-user";
import { BatchMerge } from "../../components/merge/batch-merge";

export const dynamic = 'force-dynamic';

export default async function DataKeysBatchMergePage() {
    const { isSuperUser } = await getAuthenticatedUserWithRoles();

    return (
        <>
            <Title>Merge clean groups</Title>
            <BatchMerge canMerge={isSuperUser} />
        </>
    );
}
