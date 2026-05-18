"use client";

import { EditIcon, EyeIcon, MoreVertical } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/contexts/app";

export function DeviceManagementRowActions({
  editHref,
}: {
  editHref: string;
}) {
  const { viewOnly } = useAppContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={editHref}>
            {viewOnly ? (
              <>
                <EyeIcon className="h-4 w-4 mr-2" /> View
              </>
            ) : (
              <>
                <EditIcon className="h-4 w-4 mr-2" /> Edit
              </>
            )}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
