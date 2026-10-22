import { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "@/app/actions/is-authenticated";
import { savePartial } from "@/databases/mutations/_save_partial";
import { assertContentEditable } from "@/lib/server/content-sync";
import db from "@/databases/pg/drizzle";
import { screens, screensDrafts, diagnoses, diagnosesDrafts, problems, problemsDrafts } from "@/databases/pg/schema";
import { inArray } from "drizzle-orm";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const isAuthorised = await isAuthenticated();

        if (!isAuthorised.yes) return NextResponse.json({ errors: ['Unauthorised'], }, { status: 200, });
            
        const body = await req.json();

        // Content sync: search & replace edits script content.
        try {
            const scriptIds = new Set<string>((body?.scripts || []).map((s: any) => s?.scriptId).filter(Boolean));
            const screenIds = (body?.screens || []).map((s: any) => s?.screenId).filter(Boolean);
            const diagnosisIds = (body?.diagnoses || []).map((s: any) => s?.diagnosisId).filter(Boolean);
            const problemIds = (body?.problems || []).map((s: any) => s?.problemId).filter(Boolean);
            const rows = await Promise.all([
                screenIds.length ? db.select({ id: screens.scriptId }).from(screens).where(inArray(screens.screenId, screenIds)) : [],
                screenIds.length ? db.select({ id: screensDrafts.scriptId, id2: screensDrafts.scriptDraftId }).from(screensDrafts).where(inArray(screensDrafts.screenDraftId, screenIds)) : [],
                diagnosisIds.length ? db.select({ id: diagnoses.scriptId }).from(diagnoses).where(inArray(diagnoses.diagnosisId, diagnosisIds)) : [],
                diagnosisIds.length ? db.select({ id: diagnosesDrafts.scriptId, id2: diagnosesDrafts.scriptDraftId }).from(diagnosesDrafts).where(inArray(diagnosesDrafts.diagnosisDraftId, diagnosisIds)) : [],
                problemIds.length ? db.select({ id: problems.scriptId }).from(problems).where(inArray(problems.problemId, problemIds)) : [],
                problemIds.length ? db.select({ id: problemsDrafts.scriptId, id2: problemsDrafts.scriptDraftId }).from(problemsDrafts).where(inArray(problemsDrafts.problemDraftId, problemIds)) : [],
            ]);
            rows.flat().forEach((r: any) => { if (r.id) scriptIds.add(r.id); if (r.id2) scriptIds.add(r.id2); });
            await assertContentEditable({ area: 'scripts', scriptIds: Array.from(scriptIds), userRole: isAuthorised.user?.role, viaApiKey: isAuthorised.viaApiKey, });
        } catch (e: any) {
            return NextResponse.json({ success: false, errors: [e.message], });
        }
        
        const data = await savePartial({
            ...body,
            userId: isAuthorised.user?.userId,
        });

        return NextResponse.json(data);
    } catch(e: any) {
        logger.log('/api/save', e);
        return NextResponse.json({ errors: [e.message], });
    }
}
