import * as ops from "@/app/actions/ops";
import { getAuthenticatedUser } from "@/app/actions/get-authenticated-user";
import { getSites } from "@/app/actions/sites";
import { getSys } from "@/app/actions/sys";

export const appServerActions = {
    _getAuthenticatedUser: getAuthenticatedUser,
    _revalidatePath: ops.revalidatePath,
    _countAllDrafts: ops.countAllDrafts,
    _getCookie: ops.getCookie,
    _setCookie: ops.setCookie,
    _getMode: ops.getMode,
    _setMode: ops.setMode,
    _publishData: ops.publishData,
    _discardDrafts: ops.discardDrafts,
    _getSites: getSites,
    _getSys: getSys,
} as const;
