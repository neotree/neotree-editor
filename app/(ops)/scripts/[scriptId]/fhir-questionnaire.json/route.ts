import { NextResponse } from "next/server";

import { _getDiagnoses, _getScreens, _getScripts } from "@/databases/queries/scripts";
import { scriptToFhirQuestionnaire } from "@/lib/fhir/questionnaire";

export const dynamic = "force-dynamic";

export async function GET(
    request: Request,
    { params }: { params: { scriptId: string } }
) {
    try {
        const scripts = await _getScripts({
            scriptsIds: [params.scriptId],
            returnDraftsIfExist: true,
        });

        if (scripts.errors?.length) {
            return NextResponse.json({ errors: scripts.errors }, { status: 500 });
        }

        const script = scripts.data[0];
        if (!script) {
            return NextResponse.json(
                { errors: ["No script found."] },
                { status: 404 }
            );
        }

        const url = new URL(request.url);
        const download = url.searchParams.get("download") === "1";
        const includeImages = url.searchParams.get("images") !== "0";
        const timeoutParam = Number(url.searchParams.get("imageTimeoutMs"));
        const imageFetchTimeoutMs = Number.isFinite(timeoutParam) ? timeoutParam : 4000;
        const imageModeParam = url.searchParams.get("imageMode");
        const imageMode = imageModeParam === "base64" ? "base64" : "url";
        const splitNoneOption = url.searchParams.get("splitNoneOption") === "1";

        const [screens, diagnoses] = await Promise.all([
            _getScreens({
                scriptsIds: [script.scriptId],
                returnDraftsIfExist: true,
            }),
            _getDiagnoses({
                scriptsIds: [script.scriptId],
                returnDraftsIfExist: true,
            }),
        ]);

        if (screens.errors?.length || diagnoses.errors?.length) {
            return NextResponse.json(
                { errors: [...(screens.errors || []), ...(diagnoses.errors || [])] },
                { status: 500 }
            );
        }

        const questionnaire = await scriptToFhirQuestionnaire(
            {
                ...script,
                screens: screens.data,
                diagnoses: diagnoses.data,
                drugsLibrary: [],
            },
            {
                includeImages,
                imageFetchTimeoutMs,
                imageMode,
                splitNoneOption,
            }
        );

        return new NextResponse(JSON.stringify(questionnaire, null, 4), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                ...(download
                    ? {
                          "Content-Disposition": `attachment; filename=\"fhir-questionnaire-${params.scriptId}.json\"`,
                      }
                    : {}),
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { errors: [error?.message || "Failed to build questionnaire."] },
            { status: 500 }
        );
    }
}
