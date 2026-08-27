import { NextRequest, NextResponse } from "next/server";

import { getOutcomeReferenceImpact } from "@/app/actions/scripts";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import logger from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const authorised = await isAuthenticated();
    if (!authorised.yes) return NextResponse.json({ errors: ["Unauthorised"] });

    const params = JSON.parse(req.nextUrl.searchParams.get("data") || "{}");
    return NextResponse.json(await getOutcomeReferenceImpact(params));
  } catch (e: any) {
    logger.error("[GET] /api/scripts/outcome-references", e?.message);
    return NextResponse.json({ errors: ["Internal Error"] });
  }
}
