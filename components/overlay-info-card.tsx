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

type OverlayInfoCardProps = {
    children?: React.ReactNode;
    show?: boolean;
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

    const { show, children, } = props;

    return (
        <>
            {!show ? null : (
                <div
                    className={cn(`
                        z-[99999999999999999999999999999999999999]
                        fixed bottom-10 left-10    
                    `)}
                >
                    <Card>
                        <CardContent>
                            <CardHeader />
                            {children}
                            <CardFooter />
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

    return null;
}
