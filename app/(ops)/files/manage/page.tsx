import { getAuthenticatedUserWithRoles } from '@/app/actions/get-authenticated-user';
import { Redirect } from '@/components/redirect';
import { loadData } from './_data';
import { FilesTable } from './_table';

export default async function FileManagerPage() {
    const user = await getAuthenticatedUserWithRoles();

    if (!user || !user.isSuperUser) {
        return <Redirect to="/" />;
    }

    const data = await loadData();

    return (
        <>
            <FilesTable 
                data={data}
            />
        </>
    );
}
