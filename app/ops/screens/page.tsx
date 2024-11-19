import { getScreenColumns } from "@/app/actions/screens-ops";
import { Content } from "./components/content";
import { Alert } from "@/components/alert";

export default async function ScreensOps() {
    const [
        { data: columns, errors: columnsErrors },
    ] = await Promise.all([
        getScreenColumns(),
    ]);

    const errors = [...(columnsErrors || [])];

    if (errors.length) {
        return (
            <Alert 
                title="Error"
                message={errors?.join(', ')}
                variant="error"
            />
        );
    }

    return (
        <>
            <Content 
                columns={columns}
            />
        </>
    );
}
