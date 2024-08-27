import { sendAuthCode } from "@/app/actions/send-auth-code";
import { isEmailRegistered } from "@/app/actions/users";
import { revalidatePath, test } from "@/app/actions/ops";
import { Title } from "@/components/title";
import { Form } from "./components/form";

export default async function SignInPage({ searchParams: { shouldFail }, }: { searchParams: { [key: string]: string; } }) {
    await test({ shouldFail: shouldFail === '1', });

    return (
        <>
            <Title>Sign in</Title>
            <Form 
                sendAuthCode={sendAuthCode}
                isEmailRegistered={isEmailRegistered}
                revalidatePath={revalidatePath}
            />
        </>
    );
}
