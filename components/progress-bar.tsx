'use client';

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ProgressBarProps = {
    
};

export function ProgressBar({}: ProgressBarProps) {
    const [progress, setProgress] = useState(Math.floor(Math.random() * (13 - 0 + 1) + 0))

    useEffect(() => {
        const timer1 = setTimeout(() => setProgress(Math.floor(Math.random() * (50 - 14 + 1) + 14)), 500);
        const timer2 = setTimeout(() => setProgress(Math.floor(Math.random() * (100 - 51 + 1) + 51)), 1000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <>
            {createPortal(
                <div
                    className="
                        fixed
                        top-0
                        left-0
                        z-[99999999999]
                        w-full
                        h-full
                    "
                >
                    <div style={{ width: `${progress}%`, }} className="bg-primary h-[6px] transition-all duration-500" />
                </div>,
                document.body
            )}
        </>
    );
}
