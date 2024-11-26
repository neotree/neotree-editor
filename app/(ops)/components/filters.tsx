'use client';

import { MoreVertical, Trash, ChevronDown } from "lucide-react"
import { useMeasure } from "react-use";

import { SCREEN_TYPES, SCRIPT_TYPES } from "@/databases/constants";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Props } from "./types";
import { useFilters } from "./use-filters";

export function Filters({
    filters,
    setFilters,
}: Props & ReturnType<typeof useFilters>) {
    const [contentDivRef, contentDiv] = useMeasure<HTMLDivElement>();

    return (
        <div ref={contentDivRef}>
            <div className="flex flex-col gap-y-6">
            <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">
                                {!filters.scriptsTypes.length ? 'Select script types' : (
                                    filters.scriptsTypes.length > 1 ? 
                                        `${filters.scriptsTypes.length} script types`
                                        :
                                        filters.scriptsTypes[0]
                                )}
                                <ChevronDown className="ml-auto h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            className="max-h-[400px] overflow-y-auto"
                            style={{ width: contentDiv.width, }}
                        >
                            <DropdownMenuLabel>Script types</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className=" max-h-[400px] overflow-y-auto">
                                {SCRIPT_TYPES.map(t => {
                                    const checked = filters.scriptsTypes.includes(t);
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={t}
                                            checked={checked}
                                            onCheckedChange={() => {
                                                setFilters(prev => ({
                                                    scriptsTypes: checked ? prev.scriptsTypes.filter(v => v !== t) : [...prev.scriptsTypes, t],
                                                }));
                                            }}
                                        >
                                            <div dangerouslySetInnerHTML={{ __html: t, }} />
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">
                                {!filters.screensTypes.length ? 'Select screen types' : (
                                    filters.screensTypes.length > 1 ? 
                                        `${filters.screensTypes.length} screen types`
                                        :
                                        filters.screensTypes[0]
                                )}
                                <ChevronDown className="ml-auto h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                            className="max-h-[400px] overflow-y-auto"
                            style={{ width: contentDiv.width, }}
                        >
                            <DropdownMenuLabel>Screen types</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className=" max-h-[400px] overflow-y-auto">
                                {SCREEN_TYPES.map(t => {
                                    const checked = filters.screensTypes.includes(t);
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={t}
                                            checked={checked}
                                            onCheckedChange={() => {
                                                setFilters(prev => ({
                                                    screensTypes: checked ? prev.screensTypes.filter(v => v !== t) : [...prev.screensTypes, t],
                                                }));
                                            }}
                                        >
                                            <div dangerouslySetInnerHTML={{ __html: t, }} />
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
