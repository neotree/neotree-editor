"use client";

import { EditIcon, EyeIcon, MoreVertical, UnlinkIcon } from "lucide-react";
import Link from "next/link";

import { unlinkDeviceFromMdmFromForm } from "@/app/actions/device-management";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/contexts/app";

export function DeviceManagementRowActions({
  editHref,
  linkId,
}: {
  editHref: string;
  linkId?: string | null;
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
        {linkId && !viewOnly ? (
          <DropdownMenuItem asChild>
            <form action={unlinkDeviceFromMdmFromForm}>
              <input type="hidden" name="linkId" value={linkId} />
              <input type="hidden" name="returnTo" value="/device-management?section=devices" />
              <button type="submit" className="flex w-full items-center">
                <UnlinkIcon className="h-4 w-4 mr-2" /> Unlink
              </button>
            </form>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
