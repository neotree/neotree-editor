import { NextRequest, NextResponse } from "next/server";
import queryString from "query-string";

import { _getUser } from "@/databases/queries/users";
import { isEmailRegistered } from "@/app/actions/users";

export async function GET(req: NextRequest) {
    const { email } = queryString.parse(req.nextUrl.searchParams.toString());

    if (!email) return NextResponse.json({ errors: ['Missing: email'], });

    const res = await isEmailRegistered(email as string);

    return NextResponse.json(res);
}
