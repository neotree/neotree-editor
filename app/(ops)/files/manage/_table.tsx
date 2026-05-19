'use client';

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { loadData } from "./_data";

export function FilesTable({ data }: {
    data: Awaited<ReturnType<typeof loadData>>;
}) {
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Card className="w-[80%] max-w-[400px]">
                    <CardHeader />
                    <CardContent>
                        <div className="text-xl text-center opacity-50">No data found</div>
                    </CardContent>
                    <CardFooter />
                </Card>
            </div>
        );
    }
    return (
        <>

        </>
    );
}
