import { type NextRequest, NextResponse } from "next/server"
import { getChangeLogs } from "@/app/actions/change-logs"
import logger from "@/lib/logger"
import { isAuthenticated } from "@/app/actions/is-authenticated"

interface IParams {
    params: Promise<{
        version: string;
    }>;
}

export async function GET(req: NextRequest, { params }: IParams) {
  try {
    const isAuthorised = await isAuthenticated()

    if (!isAuthorised.yes) return NextResponse.json({ errors: ["Unauthorised"] }, { status: 401 })

    const { version } = await params;
    const sortByParam = req.nextUrl.searchParams.get('sortBy') as null | NonNullable<Parameters<typeof getChangeLogs>[0]>['sortBy'];
    const sortOrderParam = req.nextUrl.searchParams.get('sortOrder') as null | NonNullable<Parameters<typeof getChangeLogs>[0]>['sortOrder'];
    const limitParam = req.nextUrl.searchParams.get('limit');
    const offsetParam = req.nextUrl.searchParams.get('offset');

    const limit = Math.max(1, Math.min(Number(limitParam) || 500, 2000))
    const offset = Math.max(0, Number(offsetParam) || 0)

    const data = await getChangeLogs({
      sortBy: sortByParam || "dateOfChange",
      sortOrder: sortOrderParam || "desc",
      dataVersions: [Number(version)],
      limit,
      offset,
    });

    return NextResponse.json(data)
  } catch (e: any) {
    logger.log("GET /api/changelogs/get/[version]", e)
    return NextResponse.json({ errors: [e.message] }, { status: 500 })
  }
}
