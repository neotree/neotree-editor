'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { revalidatePath } from "@/app/actions/ops";
import { sendAuthCode } from "@/app/actions/send-auth-code";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { cn } from "@/lib/utils";
import { useAlertModal } from "@/hooks/use-alert-modal";

type Props = {
    email: string;
    sendAuthCode: typeof sendAuthCode;
    onSendCode: () => void;
    revalidatePath: typeof revalidatePath;
};

export function SignIn({ email, onSendCode, sendAuthCode, revalidatePath }: Props) {
    const { alert } = useAlertModal();
    
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(true);

    const {
        watch,
        setValue,
        register,
        handleSubmit,
    } = useForm({
        shouldUnregister: false,
        defaultValues: {
            email,
            code: '',
            password: '',
        },
    });

    const code = watch('code');

    const onSubmit = handleSubmit(async (data) => {
        try {
            setLoading(true);
            const res = await signIn('credentials', { ...data, email, redirect: false, })
            if (res?.ok) {
                revalidatePath('/', 'layout');
                router.replace('/');
            } else {
                throw new Error(res?.error || 'Failed to sign in');
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
                        {...register('email', { disabled: true, })}
                    />
                </div>

                <div className={cn('flex justify-center', showCodeInput ? '' : 'hidden')}>
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

                <div className={cn(showPasswordInput ? '' : 'hidden')}>
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
                        {loading ? 'Please wait...' : 'Sign in'}
                    </Button>

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
                                        sendAuthCode({ email });
                                    } else {
                                        setShowPasswordInput(true);
                                        setShowCodeInput(false);
                                    }
                                }
                            }}
                        >
                            {showPasswordInput ? 'Email me a sign in code' : 'Sign in with password'}
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
                                    if (!loading) onSendCode();
                                }}
                            >
                                Resend code
                            </a>
                        )}
                    </div>
                </div>
            </form>
        </>
    );
}
