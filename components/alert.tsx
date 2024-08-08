'use client';

import { useAlertModal, AlertModalOptions } from "@/hooks/use-alert-modal";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Alert(props: Partial<AlertModalOptions> & {
    redirectTo?: string;
}) {
    const router = useRouter();

    const { alert } = useAlertModal();

    useEffect(() => {
        const { redirectTo, onClose, ...opts } = props;
        alert({
            ...opts,
            variant: opts.variant || 'error',
            buttonLabel: opts.buttonLabel || 'Ok',
            onClose: () => {
                onClose?.();
                if (redirectTo) router.replace(redirectTo);
            },
        })
    }, [alert, router, props]);

    return null;
}
