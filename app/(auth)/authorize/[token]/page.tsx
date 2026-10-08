import { getToken } from "@/app/actions/tokens";
import { Title } from "@/components/title";
import { Form } from "./components/form";

type Props = {
    params: Promise<{
        token: string;
    }>;
};

export const dynamic = 'force-dynamic';

export default async function SignInPage(props: Props) {
    const params = await props.params;

    const {
        token: _token
    } = params;

    const [token] = await Promise.all([
        ...(isNaN(Number(_token)) ? [] : [getToken(Number(_token))]),
    ]);

    return (
        <>
            <Title>Sign in</Title>

            <Form token={token} />
        </>
    );
}
