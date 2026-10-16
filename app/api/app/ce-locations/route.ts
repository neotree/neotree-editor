import { NextRequest, NextResponse } from "next/server";

import logger from "@/lib/logger";
import { isAuthenticated } from "@/app/actions/is-authenticated";
import { getScriptsWithItems } from "@/app/actions/scripts";
import { _getEditorInfo } from "@/databases/queries/editor-info";
import { _getHospitals } from "@/databases/queries/hospitals";
import { locateForSites, SiteLookup } from "@/lib/conditional-expression/locate";

const MAX_EXPRESSIONS = 1000;
const SCRIPTS_TTL_MS = 10 * 60_000;

type Scripts = Awaited<ReturnType<typeof getScriptsWithItems>>['data'];
let scriptsLoad: Promise<Scripts> | null = null;

// Loading every script graph is the expensive part, and this endpoint is reachable with any
// API key, so one load serves concurrent and repeated calls for a few minutes. Failures are
// not cached, and the graph is released when the window ends.
function loadScripts(): Promise<Scripts> {
    if (!scriptsLoad) {
        const load = getScriptsWithItems({ returnDraftsIfExist: true, }, { withDataKeys: false, }).then((res) => {
            if (res.errors?.length) throw new Error(res.errors.join('; '));
            return res.data;
        });
        scriptsLoad = load;
        const release = () => { if (scriptsLoad === load) scriptsLoad = null; };
        load.catch(release);
        setTimeout(release, SCRIPTS_TTL_MS).unref();
    }
    return scriptsLoad;
}

const isSiteLookups = (value: unknown): value is SiteLookup[] => Array.isArray(value) && value.every((l) =>
    l && (l.site === null || typeof l.site === 'string')
    && Array.isArray(l.expressions) && l.expressions.every((e: unknown) => typeof e === 'string'));

// Called by node-api's daily CE digest: where does each CE that failed on a site's tablets live
// in that site's scripts? Matches the scripts as devices sync them (drafts included, like
// /sync-data). Also returns the current data version and the site names.
export async function POST(req: NextRequest) {
	try {
        const isAuthorised = await isAuthenticated();
        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 401, });

        const { sites } = await req.json();
        if (!isSiteLookups(sites)) {
            return NextResponse.json({ errors: ['sites must be an array of { site, expressions }'], }, { status: 400, });
        }
        if (sites.reduce((n, l) => n + l.expressions.length, 0) > MAX_EXPRESSIONS) {
            return NextResponse.json({ errors: [`at most ${MAX_EXPRESSIONS} expressions per request`], }, { status: 400, });
        }

        const siteIds = sites.map((l) => l.site).filter((s): s is string => !!s);
        const [scripts, editorInfo, hospitals] = await Promise.all([
            loadScripts(),
            _getEditorInfo(),
            siteIds.length ? _getHospitals({ hospitalsIds: siteIds, }) : { data: [], },
        ]);

        const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}`.replace(/\/$/, '');
        return NextResponse.json({
            sites: locateForSites(sites, scripts, hospitals.data, baseUrl),
            dataVersion: editorInfo.data?.dataVersion ?? null,
        });
	} catch(e: any) {
		logger.error('[POST] /api/app/ce-locations', e.message);
		return NextResponse.json({ errors: ['Internal Error'], }, { status: 500, });
	}
}
