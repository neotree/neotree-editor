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

type Props = {
    sendAuthCode: typeof sendAuthCode;
};

export function Form({ sendAuthCode }: Props) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [tokenId, setTokenId] = useState<number>();

    const {
        formState: { 
            errors, 
        },
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        shouldUnregister: false,
        defaultValues: {
            email: '',
            code: '',
            password: '',
            verifiedEmail: '',
        },
    });

    const code = watch('code');
    const email = watch('email');
    const verifiedEmail = watch('verifiedEmail');

    const emailVerified = useMemo(() => email && (email === verifiedEmail), [email, verifiedEmail]);

    const sendToken = useCallback(async (email: string) => {
        setLoading(true);
        sendAuthCode({ email, tokenId })
                .then(({ tokenId }) => {
                    setShowCodeInput(true);
                    setValue('verifiedEmail', email);
                    setTokenId(tokenId);
                })
                .catch(e => toast.error(e.message))
                .finally(() => setLoading(false));
    }, [tokenId, setValue, sendAuthCode]);

    const onSubmit = handleSubmit(data => {
        if (data.verifiedEmail !== data.email) {
            sendToken(data.email);
        } else {
            setLoading(true);

            const done = (error: any, success?: boolean) => {
                if (error) toast.error(error.message || error);
                if (success) router.replace('/');
            };

            signIn('credentials', { ...data, redirect: false, })
                .then(res => done(res?.error, res?.ok))
                .catch(done)
                .finally(() => setLoading(false));
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
                        {...register('email', { 
                            required: true, 
                            // disabled: loading || emailVerified,
                        })}
                    />
                </div>

                <div className={cn('flex justify-center', emailVerified && showCodeInput ? '' : 'hidden')}>
                    <InputOTP 
                        maxLength={6}
                        value={code}
                        required={showCodeInput}
                        onChange={code => {
                            setValue('code', code);
                            if (code.length === 6) onSubmit(); 
                        }}
                    >
                        <InputOTPGroup>
                            {(() => {
                                const slots: React.ReactNode[] = [];
                                for(let i = 0; i < 6; i++) slots.push(
                                    <InputOTPSlot 
                                        key={i} 
                                        index={i} 
                                        className="w-14"
                                    />
                                );
                                return slots;
                            })()}
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className={cn(emailVerified && showPasswordInput ? '' : 'hidden')}>
                    <Input 
                        type="password"
                        placeholder="Password"
                        {...register('password', { 
                            required: showPasswordInput, 
                            disabled: loading,
                        })}
                    />
                </div>

                <div className="flex flex-col gap-y-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Please wait...' : (
                            showCodeInput || showPasswordInput ? 'Sign in' : 'Send verification code'
                        )}
                    </Button>

                    {emailVerified && (
                        <div className="flex flex-col items-end gap-y-1">
                            <a
                                href="#"
                                className={cn(
                                    'text text-sm transition-colors text-secondary/60 hover:text-secondary',
                                    loading && 'opacity-20',
                                )}
                                onClick={e => {
                                    e.preventDefault();
                                    if (!loading) {
                                        setValue('code', '');
                                        setValue('password', '');
                                        if (showPasswordInput) {
                                            setShowPasswordInput(false);
                                            setShowCodeInput(true);
                                        } else {
                                            setShowPasswordInput(true);
                                            setShowCodeInput(false);
                                        }
                                    }
                                }}
                            >
                                {showPasswordInput ? 'Sign in with code' : 'Sign in with password'}
                            </a>

                            {showCodeInput && (
                                <a
                                    href="#"
                                    className={cn(
                                        'text text-sm transition-colors text-secondary/60 hover:text-secondary',
                                        loading && 'opacity-20',
                                    )}
                                    onClick={e => {
                                        e.preventDefault();
                                        if (!loading) {
                                            sendToken(email);
                                        }
                                    }}
                                >
                                    Resend code
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </>
    );
}
