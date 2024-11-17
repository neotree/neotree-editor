import { NextResponse } from "next/server";

import { _getFullFileByFileId } from "@/databases/queries/files";
import logger from "@/lib/logger";

interface IParams {
    params: {
        fileId: string;
    };
}

export async function GET(_: Request, { params: { fileId } }: IParams) {
	try {
		if (!fileId) return NextResponse.json({ errors: ['Missing fileId'] });

        const { data: file, errors } = await _getFullFileByFileId(fileId);

        if (errors?.length) return NextResponse.json({ errors });

        if (!file?.data) return NextResponse.json({ errors: ["Not found"], });

        return NextResponse.json({ data: file, });
	} catch(e) {
		logger.error('[GET] /api/files/' + fileId + '/download', e);
		return new NextResponse('Internal Error', { status: 500, });
	}
}
