'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";

import { sendAuthCode } from "@/app/actions/send-auth-code";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Props = {
    email?: string;
    sendAuthCode: typeof sendAuthCode;
    onAuthCode: (params: { tokenId: number; email: string; }) => void;
};

export function SendCode({ email, sendAuthCode, onAuthCode }: Props) {
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
            const { tokenId } = await sendAuthCode({ email });
            onAuthCode({ tokenId, email });
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
                        {loading ? 'Please wait...' : 'Send verification code'}
                    </Button>
                </div>
            </form>
        </>
    );
}
