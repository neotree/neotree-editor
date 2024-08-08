import logger from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
	try {
		return NextResponse.json({ data: [], });
	} catch(e) {
		logger.error('[GET] /api/sync', e);
		return new NextResponse('Internal Error', { status: 500, });
	}
}
