import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { _getFullUser } from "@/databases/queries/users";
import { _saveDevices } from "@/databases/mutations/devices";

// Must match CE_PREFIXES in node-api/server/queries.js.
const CE_PREFIXES = ['[Conditional expression failed to evaluate]', '[EligibilityCriteria.evaluateCondition]'];

export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], });

        const body = await req.json();

        // CE runtime failures are recorded and digested by node-api. Logging them here
        // only floods app_errors.txt with raw stacks containing patient-substituted values.
        if (typeof body?.message === 'string' && CE_PREFIXES.some((p) => body.message.startsWith(p))) {
            return NextResponse.json({ success: true, });
        }

        logger.appError(body);

		return NextResponse.json({ success: true, });
	} catch(e: any) {
		logger.error('[POST] /app/errors', e.message);
		return NextResponse.json({ errors: ['Internal Error'] });
	}
}
