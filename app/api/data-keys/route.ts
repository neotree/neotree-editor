import { NextRequest, NextResponse } from "next/server";
import queryString from "query-string";

import logger from "@/lib/logger";
import { reportedScriptIds, sweepAllScriptsConditionErrors } from "@/lib/server/condition-errors-sweep";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { GetDataKeysParams, GetDataKeysResults, _getDataKeys } from "@/databases/queries/data-keys";
import { _deleteDataKeys } from "@/databases/mutations/data-keys";
import { assertContentEditable } from "@/lib/server/content-sync";

function parseOptionalBoolean(value: unknown) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (typeof value === "boolean") return value;
    return undefined;
}

export async function GET(req: NextRequest) {
	let res: GetDataKeysResults = { data: [], };
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const { data: dataParam, ...flat } = queryString.parse(req.nextUrl.searchParams.toString()) as GetDataKeysParams & {
            data?: string;
            returnDraftsIfExist?: string | boolean;
            withDeleted?: string | boolean;
            includePendingDeletion?: string | boolean;
        };
        // Other endpoints take their params as JSON in ?data=...; remote imports call this route the
        // same way. Without reading it, returnDraftsIfExist fell back to true and another editor's
        // import received this editor's unpublished data-key drafts.
        const wrapped = (typeof dataParam === "string" && dataParam ? JSON.parse(dataParam) : {}) as GetDataKeysParams & {
            returnDraftsIfExist?: string | boolean;
            withDeleted?: string | boolean;
            includePendingDeletion?: string | boolean;
        };
        const parsed = { ...flat, ...wrapped };
        // The data-keys page sends list filters as JSON strings (names=["..."]).
        const parseList = (value: unknown) => {
            if (typeof value !== 'string') return value;
            try { return JSON.parse(value); } catch { return [value]; }
        };
        (['names', 'uniqueKeys', 'dataKeysIds', 'keys'] as const).forEach((key) => {
            if (parsed[key] !== undefined) (parsed as any)[key] = parseList(parsed[key]);
        });
        const params: GetDataKeysParams = {
            ...parsed,
            returnDraftsIfExist: parseOptionalBoolean(parsed.returnDraftsIfExist),
            withDeleted: parseOptionalBoolean(parsed.withDeleted),
            includePendingDeletion: parseOptionalBoolean(parsed.includePendingDeletion),
        };

        res = await _getDataKeys(params);
        res = {
            ...res,
            data: res.data.map(item => ({
                ...item,
                metadata: item.metadata ?? {},
            })),
        };

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[GET] /api/data-keys', e.message);
		return NextResponse.json({ ...res, errors: ['Internal Error'] });
	}
}

export async function DELETE(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });
        if (!['admin', 'super_user'].includes(isAuthorised.user?.role || '')) {
            return NextResponse.json({ errors: ['Forbidden'] }, { status: 403 });
        }
        try {
            await assertContentEditable({ area: 'dataKeys', userRole: isAuthorised.user?.role, viaApiKey: isAuthorised.viaApiKey, });
        } catch (e: any) {
            return NextResponse.json({ success: false, errors: [e.message] });
        }

        let params = {} as Parameters<typeof _deleteDataKeys>[0];
        const queryPayload = req.nextUrl.searchParams.get('data');
        if (queryPayload) {
            params = JSON.parse(queryPayload) as Parameters<typeof _deleteDataKeys>[0];
        } else {
            try {
                params = await req.json() as Parameters<typeof _deleteDataKeys>[0];
            } catch {
                params = {} as Parameters<typeof _deleteDataKeys>[0];
            }
        }

        const res = await _deleteDataKeys({
            ...params,
            userId: isAuthorised.user?.userId,
        });

        if (res.success && !params.dryRun) void sweepAllScriptsConditionErrors(reportedScriptIds(res));

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[DELETE] /api/data-keys', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
