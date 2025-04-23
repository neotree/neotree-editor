import 'dotenv/config';
import { v4 } from 'uuid';

import db from '@/databases/pg/drizzle';
import * as schema from '@/databases/pg/schema';
import logger from '@/lib/logger';
import { axiosClient } from './axios';


export async function seedScripts(site: typeof schema.sites.$inferSelect) {
    try {
        const axios = axiosClient(site);
        
        // seed editor_info
        console.log('> seed editor_info');
        const editorInfoRes = await axios.get('/get-editor-info');
        const _info = editorInfoRes.data.info ? [editorInfoRes.data.info] : [];
        const editorInfo: typeof schema.editorInfo.$inferInsert[] = _info.map((d: any) => {
            return {
                dataVersion: d.version,
                lastPublishDate: d.last_backup_date ? new Date(d.last_backup_date) : undefined,
            } satisfies typeof schema.editorInfo.$inferInsert;
        });

        // seed devices
        console.log('> seed devices');
        const devicesRes = await axios.get('/get-devices');
        const allDevices = devicesRes.data.devices.filter((s: any) => !s.deletedAt);
        const devices: typeof schema.devices.$inferInsert[] = allDevices.map((d: any) => {
            return {
               deviceHash: d.device_hash,
               deviceId: d.device_id,
               details: d.details,
               createdAt: d.createdAt ? new Date(d.createdAt) : undefined,
            } satisfies typeof schema.devices.$inferInsert;
        });

        // seed hospitals
        console.log('> seed hospitals');
        const hospitalsRes = await axios.get('/get-hospitals');
        const allHospitals = hospitalsRes.data.hospitals.filter((s: any) => !s.deletedAt);
        const hospitals: typeof schema.hospitals.$inferInsert[] = allHospitals.map((h: any) => {
            return {
                hospitalId: v4(),
                oldHospitalId: h.hospital_id,
                name: h.name,
            } satisfies typeof schema.hospitals.$inferInsert;
        });

        // seed configKeysDrafts
        console.log('> seed configKeysDrafts');
        const configKeysRes = await axios.get('/get-config-keys');
        const allConfigKeys = (configKeysRes?.data?.config_keys).filter((s: any) => !s.deletedAt);
        const configKeysDrafts: typeof schema.configKeysDrafts.$inferInsert[] = allConfigKeys
            .map((s: any, i: number) => {
                const configKeyId = v4();

                const maxPosition = allConfigKeys.length ? Math.max(...allConfigKeys.map((s: any) => s.position || 0)) : allConfigKeys.length;
                const position = s.data?.position || s.position || (maxPosition + 1 + i);
                return {
                    configKeyDraftId: configKeyId,
                    position,
                    data: {
                        configKeyId,
                        oldConfigKeyId: s.config_key_id || s.configKeyId,
                        version: 1,
                        label: s.data?.label || s.label || '',
                        summary: s.data?.summary || s.summary || '',
                        key: s.data?.configKey || s.configKey || '',
                        position,
                        source: s.data?.source || s.source || 'editor',
                    },
                } satisfies typeof schema.configKeysDrafts.$inferInsert;
            });

        // seed scriptsDrafts
        console.log('> seed scriptsDrafts');
        const scriptsRes = await axios.get('/get-scripts');
        const allScripts = (scriptsRes?.data?.scripts || []).filter((s: any) => !s.deletedAt);
        const scriptsDrafts: typeof schema.scriptsDrafts.$inferInsert[] = allScripts
            .map((s: any, i: number) => {
                const hospitalId = hospitals.filter(h => h.oldHospitalId === s.data.hospital)[0]?.hospitalId || null;
                const scriptId = v4();

                const maxPosition = allScripts.length ? Math.max(...allScripts.map((s: any) => s.position || 0)) : allScripts.length;
                const position = s.data?.position || s.position || (maxPosition + 1 + i);

                return {
                    scriptDraftId: scriptId,
                    position,
                    data: {
                        scriptId,
                        oldScriptId: s.script_id || s.scriptId,
                        hospitalId,
                        version: 1,
                        type: s.data?.type || s.type,
                        position,
                        source:  s.data?.source || s.source || '',
                        title: s.data?.title || s.title || '',
                        printTitle: s.data?.printTitle || s.printTitle || '',
                        description: s.data?.description || s.description || '',
                        exportable: s.data?.exportable || s.exportable || true,
                        nuidSearchEnabled: s.data?.nuid_search_enabled || s.nuid_search_enabled || false,
                        nuidSearchFields: s.data?.nuidSearchFields || s.nuidSearchFields || [],
                        reviewable: s.data?.reviewable || s.reviewable || false,
                        reviewConfigurations: s.data?.reviewConfigurations || s.reviewConfigurations || [],
                        lastAlias: s.data?.lastAlias || s.lastAlias || '',
                        aliases: s.data?.aliases || s.aliases || [],
                    },
                } satisfies typeof schema.scriptsDrafts.$inferInsert;
            });

        // seed screensDrafts
        console.log('> seed screensDrafts');
        const screensRes = await axios.get('/get-screens');
        const allScreens = (screensRes?.data?.screens || []).filter((s: any) => !s.deletedAt);
        let screensDrafts: typeof schema.screensDrafts.$inferInsert[] = allScreens
            .map((s: any, i: number) => {
                const oldScriptId = s.scriptId || s.script_id || s.data.scriptId || s.data.script_id;
                const oldScreenId = s.screenId || s.screen_id || s.data.screenId || s.data.screen_id;
                const scriptId = scriptsDrafts.filter(d => d.data.oldScriptId === oldScriptId)[0]?.data?.scriptId!;
                const scriptDraftId = scriptsDrafts.filter(d => d.data.oldScriptId === oldScriptId)[0]?.scriptDraftId!;

                const scriptScreens = allScreens.filter((s: any) => {
                    const scriptId = s.scriptId || s.script_id || s.data.scriptId || s.data.script_id;
                    return scriptId === oldScriptId;
                });
                const maxPosition = scriptScreens.length ? Math.max(...scriptScreens.map((s: any) => s.position || 0)) : scriptScreens.length;

                const metadata: any = { ...s?.data?.metadata, };

                const screenId = v4();

                const type = s.data.type || s.type;
                const position = s.position || s.data.position || (maxPosition + 1 + i);

                return {
                    type,
                    position,
                    screenDraftId: screenId,
                    scriptDraftId,
                    data: {
                        screenId,
                        oldScreenId,
                        oldScriptId,
                        scriptId,
                        version: 1,
                        type,
                        position,
                        source: s.data?.source || s.source || '',
                        sectionTitle: s.data.sectionTitle || s.sectionTitle || '',
                        condition: s.data.condition || s.condition || '',
                        epicId: s.data.epicId || s.epicId || '',
                        storyId: s.data.storyId || s.storyId || '',
                        refId: s.data.refId || s.refId || '',
                        refKey: s.data.refKey || s.refKey || '',
                        step: s.data.step || s.step || '',
                        actionText: s.data.actionText || s.actionText || '',
                        contentText: s.data.contentText || s.contentText || '',
                        title: s.data.title || s.title || '',
                        title1: metadata.title1 || s.data.title1 || s.title1 || '',
                        title2: metadata.title2 || s.data.title2 || s.title2 || '',
                        title3: metadata.title3 || s.data.title3 || s.title3 || '',
                        title4: metadata.title4 || s.data.title4 || s.title4 || '',
                        instructions: metadata.instructions || s.data.instructions || s.instructions || '',
                        // instructions1: metadata.instructions1 || s.data.instructions1 || s.instructions1 || '',
                        instructions2: metadata.instructions2 || s.data.instructions2 || s.instructions2 || '',
                        instructions3: metadata.instructions3 || s.data.instructions3 || s.instructions3 || '',
                        instructions4: metadata.instructions4 || s.data.instructions4 || s.instructions4 || '',
                        hcwDiagnosesInstructions: s.data.hcwDiagnosesInstructions || s.hcwDiagnosesInstructions || '',
                        suggestedDiagnosesInstructions: s.data.suggestedDiagnosesInstructions || s.suggestedDiagnosesInstructions || '',
                        notes: s.data.notes || s.notes || '',
                        dataType: metadata.dataType || s.data.dataType || '',
                        key: metadata.key || s.data.key || '',
                        label: metadata.label || s.data.label || '',
                        negativeLabel: metadata.negativeLabel || s.data.negativeLabel || '',
                        positiveLabel: metadata.positiveLabel || s.data.positiveLabel || '',
                        previewTitle: metadata.previewTitle || s.data.previewTitle || '',
                        previewPrintTitle: metadata.previewPrintTitle || s.data.previewPrintTitle || '',
                        timerValue: metadata.timerValue || s.data.timerValue || s.timerValue || null,
                        multiplier: metadata.multiplier || s.data.multiplier || s.multiplier || null,
                        minValue: metadata.minValue || s.data.minValue || s.minValue || null,
                        maxValue: metadata.maxValue || s.data.maxValue || s.maxValue || null,
                        exportable: s.data.exportable || s.exportable || true,
                        printable: s.data.printable || s.printable || true,
                        skippable: s.data.skippable || s.skippable || false,
                        confidential: metadata.confidential || s.data.confidential || s.confidential || false,
                        prePopulate: s.data.prePopulate || s.prePopulate || [],
                        fields: (metadata.fields || s.data.fields || []).map((f: any) => ({
                            ...f,
                            fieldId: v4(),
                        })),
                        items: (metadata.items ||  s.data.items || []).map((f: any, i: number) => ({
                            ...f,
                            itemId: v4(),
                            type: f.type || '',
                            subType: f.subType || '',
                            position: f.position || (i + 1),
                            label: f.label || '',
                            id: f.id || '',
                        })),
                        text1: metadata.text1 || s.data.text1 || s.text1 || '',
                        text2: metadata.text2 || s.data.text2 || s.text2 || '',
                        text3: metadata.text3 || s.data.text3 || s.text3 || '',
                        image1: metadata.image1 || s.data.image1 || s.image1 || null,
                        image2: metadata.image2 || s.data.image2 || s.image2 || null,
                        image3: metadata.image3 || s.data.image3 || s.image3 || null,
                    },
                } satisfies typeof schema.screensDrafts.$inferInsert;
            });
        screensDrafts = screensDrafts.filter(s => s.scriptDraftId);

        // seed diagnosesDrafts
        console.log('> seed diagnosesDrafts');
        const diagnosesRes = await axios.get('/get-diagnoses');
        const allDiagnoses = (diagnosesRes?.data?.diagnoses || []).filter((s: any) => !s.deletedAt);
        let diagnosesDrafts: typeof schema.diagnosesDrafts.$inferInsert[] = allDiagnoses
            .map((s: any, i: number) => {
                const oldScriptId = s.scriptId || s.script_id || s.data.scriptId || s.data.script_id;
                const oldDiagnosisId = s.diagnosisId || s.diagnosis_id || s.data.diagnosisId || s.data.diagnosis_id;
                const scriptId = scriptsDrafts.filter(d => d.data.oldScriptId === oldScriptId)[0]?.data?.scriptId!;
                const scriptDraftId = scriptsDrafts.filter(d => d.data.oldScriptId === oldScriptId)[0]?.scriptDraftId!;

                const scriptDiagnoses = allDiagnoses.filter((s: any) => {
                    const scriptId = s.scriptId || s.script_id || s.data.scriptId || s.data.script_id;
                    return scriptId === oldScriptId;
                });
                const maxPosition = scriptDiagnoses.length ? Math.max(...scriptDiagnoses.map((s: any) => s.position || 0)) : scriptDiagnoses.length;

                const diagnosisId = v4();

                const position = s.position || s.data.position || (maxPosition + 1 + i);

                return {
                    position,
                    diagnosisDraftId: diagnosisId,
                    scriptDraftId,
                    data: {
                        diagnosisId,
                        oldDiagnosisId,
                        oldScriptId,
                        scriptId,
                        version: 1,
                        position,
                        source: s.data?.source || s.source || '',
                        name: s.data.name || s.name || '',
                        description: s.data.description || s.description || '',
                        key: s.data.key || s.key || '',
                        expression: s.data.expression || s.expression || '',
                        expressionMeaning: s.data.expressionMeaning || s.expressionMeaning || '',
                        severityOrder: s.data.severity_order || s.severity_order || null,
                        text1: s.data.text1 || s.text1 || '',
                        text2: s.data.text2 || s.text2 || '',
                        text3: s.data.text3 || s.text3 || '',
                        image1: s.data.image1 || s.image1 || null,
                        image2: s.data.image2 || s.image2 || null,
                        image3: s.data.image3 || s.image3 || null,
                        symptoms: (s.data.symptoms || s.symptoms || []).map(({ ...s }: any, i: number) => ({
                            ...s,
                            position: i + 1,
                            symptomId: v4(),
                            printable: true,
                            weight: s.weight || null,
                        })),
                    },
                } satisfies typeof schema.diagnosesDrafts.$inferInsert;
            });
        diagnosesDrafts = diagnosesDrafts.filter(s => s.scriptDraftId);

        await db.delete(schema.editorInfo);
        await db.delete(schema.devices);
        await db.delete(schema.hospitals);
        await db.delete(schema.configKeys);
        await db.delete(schema.scripts);
        await db.delete(schema.screens);
        await db.delete(schema.diagnoses);
        await db.delete(schema.configKeysDrafts);
        await db.delete(schema.scriptsDrafts);
        await db.delete(schema.screensDrafts);
        await db.delete(schema.diagnosesDrafts);

        if (editorInfo.length) await db.insert(schema.editorInfo).values(editorInfo);
        if (devices.length) await db.insert(schema.devices).values(devices);
        if (hospitals.length) await db.insert(schema.hospitals).values(hospitals);
        if (configKeysDrafts.length) await db.insert(schema.configKeysDrafts).values(configKeysDrafts);
        if (scriptsDrafts.length) await db.insert(schema.scriptsDrafts).values(scriptsDrafts);
        if (screensDrafts.length) await db.insert(schema.screensDrafts).values(screensDrafts);
        if (diagnosesDrafts.length) await db.insert(schema.diagnosesDrafts).values(diagnosesDrafts);
    } catch(e: any) {
        logger.error('seedScripts ERROR', e);
    } finally {
        process.exit();
    }
}
