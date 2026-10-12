'use client';

import { useState } from "react";
import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Card({ children, }: {
    children: React.ReactNode;
}) {
    const [hide, setHide] = useState(false);

    if (hide) return null;

    return (
        <div className="relative">
            {children}
            <Button 
                variant="ghost"
                className="absolute top-0 right-0"
                onClick={() => {
                    const confirmed = confirm('Hide script? Are you sure?');
                    if (confirmed) setHide(true);
                }}
            >
                <XIcon className="size-4" />
            </Button>
        </div>
    );
}
