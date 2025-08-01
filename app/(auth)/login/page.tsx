import { sendAuthCode } from "@/app/actions/send-auth-code";
import { isEmailRegistered, setPassword } from "@/app/actions/users";
import { Title } from "@/components/title";
import { Form } from "./components/form";

export const dynamic = 'force-dynamic';

export default async function SignInPage() {
    return (
        <>
            <Title>Sign in</Title>
            <Form 
                sendAuthCode={sendAuthCode}
                isEmailRegistered={isEmailRegistered}
                setPassword={setPassword}
            />
        </>
    );
}
