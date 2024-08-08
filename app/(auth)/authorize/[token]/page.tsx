import { getToken } from "@/app/actions/tokens";
import { Title } from "@/components/title";
import { Form } from "./components/form";

type Props = {
    params: {
        token: string;
    };
};

export default async function SignInPage({ params: { token: _token } }: Props) {
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
