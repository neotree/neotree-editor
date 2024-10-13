'use client';

import { useEffect } from "react";
import { RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ErrorPage({ error, reset }: {
    error: Error & { digest?: string; };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error]);

    return (
        <>
            <Card>
                <CardContent className="px-4 py-4 flex flex-col justify-center items-center gap-y-4">
                    <div className="text-3xl">Something went wrong</div>
                    <Button size="icon" onClick={() => reset()}>
                        <RefreshCcw />
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}
