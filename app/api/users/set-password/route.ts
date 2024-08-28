import { NextRequest, NextResponse } from "next/server";

import { _getUser } from "@/databases/queries/users";
import { setPassword } from "@/app/actions/users";

export async function POST(req: NextRequest) {
    const body = await req.json();
    
    const data = await setPassword(body);

    return NextResponse.json(data);
}
