import { NextResponse } from "next/server";

import { _getFileReferences, _getFullFileByFileId } from "@/databases/queries/files";
import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";

interface IParams {
    params: Promise<{
        fileId: string;
    }>;
}

export async function GET(_: Request, props: IParams) {
    const params = await props.params;

    const {
        fileId
    } = params;

    try {
        const isAuthorised = await isAuthenticated();
        
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });

		if (!fileId) return NextResponse.json({ errors: ['Missing fileId'] });

        const res = await _getFileReferences({ fileId });

        return NextResponse.json(res);
	} catch(e) {
		logger.error('[GET] /api/files/' + fileId + '/references', e);
		return new NextResponse('Internal Error', { status: 500, });
	}
}
