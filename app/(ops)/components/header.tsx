'use client';

import { FilterIcon } from "lucide-react";

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ucFirst from "@/lib/ucFirst";
import { useFilters } from "./use-filters";
import { Filters } from "./filters";

type Props = ReturnType<typeof useFilters> & {
    children?: React.ReactNode;
};

export function Header({ children, ...props }: Props) {
    const {
        dataType,
        loadData,
    } = props;

    return (
        <>
            <div className="h-[60px]" />

            <div
                className="
                    h-[60px]
                    border-b
                    fixed
                    top-0
                    left-0
                    w-full
                    px-4
                    flex
                    items-center
                    bg-white
                    z-10
                    gap-x-4
                "
            >
                <div className="text-xl">{ucFirst(dataType)}</div>

                <div className="ml-auto" />

                {children}

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline">
                            <FilterIcon className="h-4 w-4 mr-2" />
                            Filters
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="p-0 flex flex-col">
                        <SheetHeader className="p-4">
                            <SheetTitle>Filter {dataType}</SheetTitle>
                            <SheetDescription>{''}</SheetDescription>
                        </SheetHeader>
                        
                        <div className="flex-1 px-4 overflow-y-auto">
                            <Filters 
                                {...props}
                            />
                        </div>

                        <SheetFooter className="p-4 border-t">
                            <SheetClose asChild>
                                <Button
                                    className="w-full mt-6"
                                    onClick={() => loadData()}
                                >
                                    Load {props.dataType}
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
