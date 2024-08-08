import { NextResponse } from "next/server";
import stream, { Readable } from 'stream';

import { _getFullFileByFileId } from "@/databases/queries/files";
import logger from "@/lib/logger";

interface IParams {
    params: {
        fileId: string;
    };
}

class StreamingResponse extends Response {
    constructor( res: ReadableStream<any>, init?: ResponseInit ) {
        super(res as any, {
            ...init,
            status: 200,
            headers: {
                ...init?.headers,
            },
        });
    }
}

export async function GET(_: Request, { params: { fileId } }: IParams) {
	try {
		if (!fileId) return new NextResponse(null, { status: 400, statusText: "Bad Request" });

        const { file, errors } = await _getFullFileByFileId(fileId);

        if (errors?.length) return new NextResponse(null, { status: 400, statusText: errors.join(', ') });

        if (!file?.data) return new NextResponse(null, { status: 404, statusText: "Not found" });

        const stream = new ReadableStream<any>({
            async start(controller) {
                controller.enqueue(file.data),
                controller.close();
            },
        });

        return new StreamingResponse(stream);
	} catch(e) {
		logger.error('[GET] /api/files/' + fileId, e);
		return new NextResponse('Internal Error', { status: 500, });
	}
}
