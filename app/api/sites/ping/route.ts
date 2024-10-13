import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
	try {
		return NextResponse.json({ data: 'pong', });
	} catch(e: any) {
		logger.error('[GET] /api/sites/ping', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
