import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _deleteAndReplaceFiles, type DeleteAndReplaceFiles, type DeleteAndReplaceFilesResponse, } from "@/databases/mutations/files";

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const params: DeleteAndReplaceFiles = await req.json();

        const res = await _deleteAndReplaceFiles(params);

		return NextResponse.json(res);
	} catch(e: any) {
		logger.error('[POST] /api/files/delete-and-replace', e.message);
		return NextResponse.json({ 
            success: false, 
            errors: ['Internal Error'], 
        } satisfies DeleteAndReplaceFilesResponse);
	}
}
