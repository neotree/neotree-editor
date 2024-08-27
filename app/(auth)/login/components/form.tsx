'use client';

import { useState } from "react";

import { revalidatePath } from "@/app/actions/ops";
import { sendAuthCode } from "@/app/actions/send-auth-code";
import { isEmailRegistered } from "@/app/actions/users";
import { SendCode } from "./send-code";
import { SignIn } from "./sign-in";

type Props = {
    sendAuthCode: typeof sendAuthCode;
    isEmailRegistered: typeof isEmailRegistered;
    revalidatePath: typeof revalidatePath;
};

export function Form({ sendAuthCode, revalidatePath, isEmailRegistered }: Props) {
    const [show, setShow] = useState<'sendCodeForm' | 'signInForm'>('sendCodeForm');
    const [email, setEmail] = useState('');

    return (
        <>
            {(show === 'sendCodeForm') && (
                <SendCode 
                    email={email}
                    sendAuthCode={sendAuthCode}
                    isEmailRegistered={isEmailRegistered}
                    onAuthCode={({ email }) => {
                        setEmail(email);
                        setShow('signInForm');
                    }}
                />
            )}

            {(show === 'signInForm') && (
                <SignIn 
                    email={email}
                    onSendCode={() => setShow('sendCodeForm')}
                    sendAuthCode={sendAuthCode}
                    revalidatePath={revalidatePath}
                />
            )}
        </>
    )
}
