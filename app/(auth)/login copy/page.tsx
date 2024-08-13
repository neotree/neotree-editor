import { sendAuthCode } from "@/app/actions/send-auth-code";
import { Title } from "@/components/title";
import { Form } from "./components/form";

export default function SignInPage() {
    return (
        <>
            <Title>Sign in</Title>
            <Form 
                sendAuthCode={sendAuthCode}
            />
        </>
    );
}
