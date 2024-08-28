'use client';

import { useState } from "react";

import { sendAuthCode } from "@/app/actions/send-auth-code";
import { isEmailRegistered, setPassword } from "@/app/actions/users";
import { VerifyEmail } from "./verify-email";
import { SignIn } from "./sign-in";

type Props = {
    setPassword: typeof setPassword;
    sendAuthCode: typeof sendAuthCode;
    isEmailRegistered: typeof isEmailRegistered;
};

export function Form({ sendAuthCode, isEmailRegistered, setPassword }: Props) {
    const [show, setShow] = useState<'verifyEmailForm' | 'signInForm'>('verifyEmailForm');
    const [email, setEmail] = useState('');
    const [shouldSetPassword, setShouldSetPassword] = useState(false);

    return (
        <>
            {(show === 'verifyEmailForm') && (
                <VerifyEmail 
                    email={email}
                    sendAuthCode={sendAuthCode}
                    isEmailRegistered={isEmailRegistered}
                    onEmailVerified={({ email, isActive }) => {
                        setEmail(email);
                        setShouldSetPassword(!isActive);
                        setShow('signInForm');
                    }}
                />
            )}

            {(show === 'signInForm') && (
                <SignIn 
                    email={email}
                    onSendCode={() => {
                        setShow('verifyEmailForm');
                        setShouldSetPassword(false);
                    }}
                    sendAuthCode={sendAuthCode}
                    shouldSetPassword={shouldSetPassword}
                    setPassword={setPassword}
                />
            )}
        </>
    )
}
