'use client';

import { useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"

import { getToken } from "@/app/actions/tokens";
import { Loader } from "@/components/loader";
import { Card, CardContent } from "@/components/ui/card";
import { useEffectOnce } from "@/hooks/use-effect-once";

type Props = {
    token: Awaited<ReturnType<typeof getToken>>;
};

export async function Form({ token }: Props) {
    const router = useRouter();

    const onSignIn = useCallback(() => {
        if (token?.user?.email) {
            const done = (error: any, success?: boolean) => {
                if (error) toast.error(error.message || error);
                if (success) router.replace('/');
            };

            signIn(
                'credentials', 
                { 
                    email: token?.user?.email, 
                    code: token.token,
                    redirect: false
                },
            ).then(res => done(res?.error, res?.ok))
            .catch(done);
        }
    }, [token, router]);

    useEffectOnce(onSignIn);

    return (
        <>
            {!token ? (
                <Card
                    className="border-danger bg-danger/20 text-center"
                >
                    <CardContent className="p-4 flex flex-col gap-y-4">
                        <div className="text-danger">Could not verify link, it may have expired</div>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <Loader overlay={false} />
                </div>
            )}
        </>
    );
}
