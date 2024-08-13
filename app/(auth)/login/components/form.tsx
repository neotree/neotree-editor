'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { sendAuthCode } from "@/app/actions/send-auth-code";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils";
import { SendCode } from "./send-code";
import { SignIn } from "./sign-in";

type Props = {
    sendAuthCode: typeof sendAuthCode;
};

export function Form({ sendAuthCode }: Props) {
    const [show, setShow] = useState<'sendCodeForm' | 'signInForm'>('sendCodeForm');
    const [email, setEmail] = useState('');

    return (
        <>
            {(show === 'sendCodeForm') && (
                <SendCode 
                    email={email}
                    sendAuthCode={sendAuthCode}
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
                />
            )}
        </>
    )
}
