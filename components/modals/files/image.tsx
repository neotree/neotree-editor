import { useState } from 'react';
import clsx from 'clsx';

import { Skeleton } from "@/components/ui/skeleton"
import { Image as ImageComponent, ImageProps } from "@/components/image";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

export function Image(props: ImageProps) {
    const [loaded, setLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const img = (
        <ImageComponent 
            {...props}
            onLoad={() => setLoaded(true)}
            className={clsx(!loaded && 'hidden opacity-0', props.className)}
        />
    );

    return (
        <>
            {!loaded && <Skeleton className="h-24" />}
            <Dialog
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            >
                <DialogTrigger>
                    {img}
                </DialogTrigger>

                <DialogContent 
                    hideCloseButton
                    className="px-0 py-0 flex flex-col w-full max-w-xl max-h-[80%]"
                >
                    <DialogHeader className="hidden">
                        <DialogTitle>{''}</DialogTitle>
                        <DialogDescription>{''}</DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-4 py-2">
                        {img}
                    </div>

                    <DialogFooter className="px-4 py-2">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                            >
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
