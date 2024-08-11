'use client';

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

type Props = React.HTMLProps<HTMLDivElement> & {
    value: number | string;
    showValueOnToast?: boolean;
};

export function Clipboard({
    value,
    showValueOnToast = false,
    ...props
}: Props) {
    const [_, copyToClipboard] = useCopyToClipboard({ showValueOnToast, });

    return (
        <div
            {...props}
            onClick={(...args) => {
                copyToClipboard(`${value}`);
                props.onClick?.(...args);
            }}
        />
    );
}
