import { configKeys, diagnoses, screens, scripts } from "@/databases/pg/schema";
import { ScriptField } from "@/types";

export function mapNewConfigKeysToOld(s: typeof configKeys.$inferSelect) {
    return {
        id: s.id,
        config_key_id: s.oldConfigKeyId || s.configKeyId,
        position: s.position,
        deletedAt: s.deletedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        data: {
            configKey: s.key,
            configKeyId: s.oldConfigKeyId || s.configKeyId,
            createdAt: s.createdAt,
            label: s.label,
            source: s.source,
            summary: s.summary,
            updatedAt: s.updatedAt,
            position: s.position,
            id: s.id,
            preferences: s.preferences,
        },
    };
}

export function mapNewDiagnosisToOld(s: typeof diagnoses.$inferSelect) {
    return {
        id: s.id,
        diagnosis_id: s.oldDiagnosisId || s.diagnosisId,
        position: s.position,
        script_id: s.oldScriptId || s.scriptId,
        deletedAt: s.deletedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        data: {
            createdAt: s.createdAt,
            description: s.description,
            diagnosisId: s.oldDiagnosisId || s.diagnosisId,
            expression: s.expression,
            name: s.name,
            source: s.source,
            updatedAt: s.updatedAt,
            diagnosis_id: s.oldDiagnosisId || s.diagnosisId,
            scriptId: s.oldScriptId || s.scriptId,
            script_id: s.oldScriptId || s.scriptId,
            position: s.position,
            image1: !s.image1 ? null : {
                ...s.image1,
                data: (s.image1 as any)?.data?.replaceAll?.('api/files', 'file')?.split?.('?')[0] || s.image1,
            },
            image2: !s.image2 ? null : {
                ...s.image2,
                data: (s.image2 as any)?.data?.replaceAll?.('api/files', 'file')?.split?.('?')[0] || s.image2,
            },
            image3: !s.image3 ? null : {
                ...s.image3,
                data: (s.image3 as any)?.data?.replaceAll?.('api/files', 'file')?.split?.('?')[0] || s.image3,
            },
            text1: s.text1,
            text2: s.text2,
            text3: s.text3,
            deletedAt: s.deletedAt,
            expressionMeaning: s.expressionMeaning,
            key: s.key,
            severity_order: s.severityOrder,
            symptoms: s.symptoms,
            preferences: s.preferences,
        },
    };
}

export function mapNewScreenToOld(s: typeof screens.$inferSelect) {
    return {
        id: s.id,
        screen_id: s.oldScreenId || s.screenId,
        type: s.type,
        position: s.position,
        script_id: s.oldScriptId || s.scriptId,
        deletedAt: s.deletedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        data: {
            skippable: s.skippable,
            condition: s.condition,
            skipToCondition: s.skipToCondition,
            skipToScreenId: s.skipToScreenId,
            epicId: s.epicId,
            storyId: s.storyId,
            refId: s.refId,
            step: s.step,
            title: s.title,
            title2: s.title2,
            title3: s.title3,
            title4: s.title4,
            sectionTitle: s.sectionTitle,
            actionText: s.actionText,
            contentText: s.contentText,
            instructions: s.instructions,
            instructions2: s.instructions2,
            instructions3: s.instructions3,
            instructions4: s.instructions4,
            hcwDiagnosesInstructions: s.hcwDiagnosesInstructions,
            suggestedDiagnosesInstructions: s.suggestedDiagnosesInstructions,
            notes: s.notes,
            type: s.type,
            screenId: s.oldScreenId || s.screenId,
            scriptId: s.oldScriptId || s.scriptId,
            script_id: s.oldScriptId || s.scriptId,
            screen_id: s.oldScreenId || s.screenId,
            position: s.position,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            deletedAt: s.deletedAt,
            source: s.source,
            infoText: s.infoText,
            printable: s.printable,
            refKey: s.refKey,
            prePopulate: s.prePopulate,
            id: s.id,
            previewTitle: s.previewTitle,
            previewPrintTitle: s.previewPrintTitle,
            // printCategory: s.printCategory,
            // order: s.order,
            metadata: {
                confidential: s.confidential,
                dataType: s.dataType,
                key: s.key,
                label: s.label,
                text3: s.text3,
                title1: s.title1,
                title2: s.title2,
                title3: s.title3,
                text1: s.text1,
                text2: s.text2,
                image1: !s.image1 ? null : {
                    ...s.image1,
                    data: (s.image1 as any)?.data?.replaceAll?.('api/files', 'file')?.split?.('?')[0] || s.image1,
                },
                image2: !s.image2 ? null : {
                    ...s.image2,
                    data: (s.image2 as any)?.data?.replaceAll?.('api/files', 'file')?.split?.('?')[0] || s.image2,
                },
                image3: !s.image3 ? null : {
                    ...s.image3,
                    data: (s.image3 as any)?.data?.replaceAll?.('api/files', 'file')?.split?.('?')[0] || s.image3,
                },
                drugs: s.drugs,
                fluids: s.fluids,
                feeds: s.feeds,
                items: s.items,
                fields: s.fields,
                multiplier: s.multiplier,
                minValue: s.minValue,
                maxValue: s.maxValue,
                negativeLabel: s.negativeLabel,
                positiveLabel: s.positiveLabel,
                timerValue: s.timerValue,
            },
            preferences: s.preferences,
        },
    };
}

export function mapNewScriptToOld(s: typeof scripts.$inferSelect) {
    return {
        id: s.id,
        script_id: s.oldScriptId || s.scriptId,
        position: s.position,
        deletedAt: s.deletedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        data: {
            createdAt: s.createdAt,
            description: s.description,
            position: s.position,
            scriptId: s.oldScriptId || s.scriptId,
            script_id: s.oldScriptId || s.scriptId,
            title: s.title,
            updatedAt: s.updatedAt,
            deletedAt: s.deletedAt,
            type: s.type,
            exportable: s.exportable,
            hospital: s.hospitalId,
            printTitle: s.printTitle,
            id: s.id,
            nuid_search_enabled: s.nuidSearchEnabled,
            nuidSearchFields: (s.nuidSearchFields as ScriptField[]).map(f => ({
                calculation: f.calculation,
                condition: f.condition,
                confidential: f.confidential,
                dataType: f.dataType,
                defaultValue: f.defaultValue,
                format: f.format,
                type: f.type,
                key: f.key,
                refKey: f.refKey,
                label: f.label,
                minValue: f.minValue,
                maxValue: f.maxValue,
                optional: f.optional,
                minDate: f.minDate,
                maxDate: f.maxDate,
                minTime: f.minTime,
                maxTime: f.maxTime,
                minDateKey: f.minDateKey,
                maxDateKey: f.maxDateKey,
                minTimeKey: f.minTimeKey,
                maxTimeKey: f.maxTimeKey,
                values: f.values,
            })),
            preferences: s.preferences,
            printSections: s.printSections,
        },
    };
}
