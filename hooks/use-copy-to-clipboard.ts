'use client';

import { useCallback, useEffect, useState } from "react";
import { useCopyToClipboard as _useCopyToClipboard } from "react-use";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export function useCopyToClipboard(opts?: {
    showValueOnToast: boolean;
}) {
    const [state, _copyToClipboard] = _useCopyToClipboard();
    const [uid, setUid] = useState<string>();

    const copyToClipboard = useCallback((value: string) => {
        setUid(uuidv4());
        return _copyToClipboard(value);
    }, [_copyToClipboard]);

    useEffect(() => {
        if (uid) {
            setUid(undefined);
            if (state.error) {
                toast.error(`Unable to copy value: ${state.error.message}`);
            } else if (state.value) {
                toast.success('Copied' + (opts?.showValueOnToast ? `: ${state.value}` : ''), {
                    position: 'bottom-center',
                });
            }
        }
    }, [uid, state, opts]);

    return [state, copyToClipboard] as ReturnType<typeof _useCopyToClipboard>;
}
