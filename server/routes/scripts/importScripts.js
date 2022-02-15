import https from 'https';
import http from 'http';
import { Script, Screen, Diagnosis } from '../../database';
import { createScript } from './createScriptMiddleware';
import { createScreen } from '../screens/createScreenMiddleware';
import { createDiagnosis } from '../diagnoses/createDiagnosisMiddleware';

export function importScripts() {
    return (req, res, next) => {
        const { url, importScriptId, updateScriptId, } = req.body;
        (async () => {
            (`${url}`.match('https') ? https : http).get(`${url}/get-import-scripts?scriptId=${importScriptId}`, resp => {
                let _data = '';

                resp.on('data', (chunk) => {
                    _data += chunk;
                });

                resp.on('end', () => {
                    (async () => {
                        let data = null;
                        let error = null;
                        let resp = null;

                        try { 
                            data = _data ? JSON.parse(_data) : {}; 
                            
                            try {
                                resp = await Promise.all(Object.keys(data).map(key => new Promise(resolve => {
                                    (async () => {
                                        const { script, screens, diagnoses } = data[key];
    
                                        delete script.data.id;
                                        let savedScript = null;
                                        let deleteScreens = [];
                                        let deleteDiagnoses = [];
                                        if (!updateScriptId) {
                                            savedScript = await createScript(script.data);
                                        } else {
                                            const updateScript = await Script.findOne({ where: { script_id: updateScriptId } });
                                            if (updateScript) {
                                                await Script.update(
                                                    {
                                                        type: script.type,
                                                        data: JSON.stringify({ 
                                                            ...script.data,
                                                            scriptId: updateScriptId,
                                                            script_id: updateScriptId, 
                                                        }),
                                                    },
                                                    { where: { id: updateScript.id, deletedAt: null } }
                                                );
                                                deleteScreens = await Screen.findAll({ where: { script_id: updateScriptId, } });
                                                deleteDiagnoses = await Diagnosis.findAll({ where: { script_id: updateScriptId, } });
                                            }
                                            savedScript = await Script.findOne({ where: { script_id: updateScriptId } });
                                        }
    
                                        if (savedScript) {
                                            const saveScreens = async (_screens = screens, saved = []) => {
                                                const s = _screens.shift();
                                                try {
                                                    delete s.data.id;
                                                    const newScreen = await createScreen({  
                                                        ...s.data,
                                                        scriptId: updateScriptId || savedScript.script_id, 
                                                    });
                                                    if (newScreen) saved.push(newScreen);
                                                } catch(e) { /* */ }
                                                if (_screens.length) saved = await saveScreens(_screens, saved);
                                                return saved;
                                            };
                                            await saveScreens();
    
                                            const saveDiagnoses = async (_diagnoses = diagnoses, saved = []) => {
                                                const d = _diagnoses.shift();
                                                try {
                                                    delete d.data.id;
                                                    const newScreen = await createDiagnosis({  
                                                        ...d.data,
                                                        scriptId: updateScriptId || savedScript.script_id, 
                                                    });
                                                    if (newScreen) saved.push(newScreen);
                                                } catch(e) { /* */ }
                                                if (_diagnoses.length) saved = await saveDiagnoses(_diagnoses, saved);
                                                return saved;
                                            };
                                            await saveDiagnoses();

                                            const deletedAt = new Date();
                                            await Screen.update({ deletedAt }, { where: { id: deleteScreens.map(s => s.id) } });
                                            await Diagnosis.update({ deletedAt }, { where: { id: deleteDiagnoses.map(s => s.id) } });
                                        }
    
                                        resolve(savedScript);
                                    })();
                                })));
                            } catch (e) { error = e.message; }
                        } catch (e) { 
                            error = 'Failed to import, make sure the URL is correct';
                        }
                        res.locals.setResponse(error, { data: resp, });
                        next();
                    })();
                });
            }).on('error', e => {
                res.locals.setResponse(e.message);
                next();
            });
        })();
    };
}

export function getImportScripts() {
    return (req, res, next) => {
        const { scriptId } = req.query;
        (async () => {
            const where = { deletedAt: null, };
            if (scriptId) where.script_id = scriptId;
            const scripts = await Script.findAll({ where });
            const data = {};
            await Promise.all(scripts.map(script => new Promise((resolve) => {
                (async () => {                
                    const screens = await Screen.findAll({ 
                        where: { deletedAt: null, script_id: script.script_id, },
                        order: [['position', 'ASC']],
                    });
                    const diagnoses = await Diagnosis.findAll({ 
                        where: { deletedAt: null, script_id: script.script_id, }, 
                        order: [['position', 'ASC']],
                    });
                    data[script.script_id] = {};
                    data[script.script_id].script = script;
                    data[script.script_id].screens = screens;
                    data[script.script_id].diagnoses = diagnoses;

                    resolve();
                })();
            })));
            res.locals.setResponse(null, data);
            next();
        })();
    };
}

