'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import { sendAuthCode } from "@/app/actions/send-auth-code";
import { isEmailRegistered } from "@/app/actions/users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Props = {
    email?: string;
    sendAuthCode: typeof sendAuthCode;
    isEmailRegistered: typeof isEmailRegistered;
    onAuthCode: (params: { email: string; }) => void;
};

export function VerifyEmail({ email, sendAuthCode, onAuthCode, isEmailRegistered }: Props) {
    const { alert } = useAlertModal();

    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
    } = useForm({
        shouldUnregister: false,
        defaultValues: {
            email: email || '',
        },
    });

    const onSubmit = handleSubmit(async ({ email }) => {
        try {
            setLoading(true);
            // const { tokenId, errors } = await sendAuthCode({ email });
            // const { yes: emailIsRegistered, errors } = await isEmailRegistered(email);
            const res: any = await axios.get('/api/users/is-email-registered?email='+email);
            const { errors, yes: emailIsRegistered } = res.data;

            if (errors?.length || !emailIsRegistered) {
                alert({
                    title: 'Error',
                    message: errors?.join?.(', ') || 'Email address not registered, are you sure that address is typed correctly?',
                    variant: 'error',
                });
            } else {
                onAuthCode({ email });
            }
        } catch(e: any) {
            alert({
                title: 'Error',
                message: e.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    });

    return (
        <>
            <form 
                className="
                    flex
                    flex-col
                    gap-y-4
                "
                onSubmit={e => {
                    e.preventDefault();
                    onSubmit();
                }}
            >
                <div>
                    <Input 
                        type="email"
                        placeholder="Email address"
                        {...register('email', { required: true, disabled: loading, })}
                    />
                </div>

                <div className="flex flex-col gap-y-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Please wait...' : 'Continue'}
                    </Button>
                </div>
            </form>
        </>
    );
}
