'use client';

import { useEffect } from "react";
import { create } from 'zustand';

import { 
    Card, 
    CardContent, 
    CardFooter, 
    CardHeader, 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

type OverlayInfoCardProps = {
    children?: React.ReactNode;
    show?: boolean;
    onClose?: () => void;
};

type OverlayInfoCardState = {
    props: OverlayInfoCardProps;
    setProps: (props: OverlayInfoCardProps) => void;
};

const useOverlayInfoCardState = create<OverlayInfoCardState>(set => {
    return {
        props: {
            children: null,
        },
        setProps: props => set({ props, }),
    };
});

export function OverlayInfoCardProvider() {
    const { props } = useOverlayInfoCardState();

    const { show, children, onClose, } = props;

    return (
        <>
            {!show ? null : (
                <div
                    style={{ zIndex: 2147483647, }}
                    className={cn(`
                        fixed bottom-10 left-10    
                    `)}
                >
                    <Card className="relative">
                        <CardContent className="p-4">
                            {children}
                            {!!onClose && (
                                <div 
                                    role="button"
                                    className="absolute top-[1px] right-[1px] cursor-pointer"
                                    onClick={onClose}
                                >
                                    <XIcon className="size-4" />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}

export function OverlayInfoCard(props: OverlayInfoCardProps) {
    const { setProps } = useOverlayInfoCardState();
    
    useEffect(() => {
        setProps(props);
    }, [props]);

    useEffect(() => () => {
        setProps({});
    }, []);

    return null;
}
