'use client';

import { Edit, Eye, MoreVertical, Trash } from "lucide-react"
import Link from "next/link";
import { useParams } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/app";
import { IScriptsContext } from "@/contexts/scripts";

type Props = {
    diagnosis: Awaited<ReturnType<IScriptsContext['_getDiagnoses']>>['data'][0];
    onDelete: () => void;
};

export function DiagnosesTableRowActions({ 
    diagnosis: { diagnosisId, diagnosisDraftId },
    onDelete, 
}: Props) {
    const { scriptId, } = useParams();

    const { viewOnly } = useAppContext();

    const editHref = `/script/${scriptId}/diagnosis/${diagnosisId || diagnosisDraftId}`;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="p-0 h-auto w-auto transition-colors rounded-full hover:text-primary hover:bg-transparent"
                    >
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent>
                    <DropdownMenuItem 
                        asChild
                    >
                        <Link
                            href={editHref}
                        >
                            {!viewOnly ? <><Edit className="mr-2 h-4 w-4" /> Edit</> : <><Eye className="mr-2 h-4 w-4" /> View</>}
                        </Link>
                    </DropdownMenuItem>

                    {!viewOnly && (
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-danger focus:bg-danger focus:text-danger-foreground"
                        >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
