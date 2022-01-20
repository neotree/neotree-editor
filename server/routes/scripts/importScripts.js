import https from 'https';
import http from 'http';
import { Script, Screen, Diagnosis } from '../../database';
import { createScript } from './createScriptMiddleware';
import { createScreen } from '../screens/createScreenMiddleware';
import { createDiagnosis } from '../diagnoses/createDiagnosisMiddleware';

export function importScripts(app) {
    return (req, res, next) => {
        const { url, scriptId } = req.body;
        (async () => {
            ((url || '').match('https') ? https : http).get(`${url}/get-import-scripts?scriptId=${scriptId}`, resp => {
                let _data = '';

                resp.on('data', (chunk) => {
                    _data += chunk;
                });

                resp.on('end', () => {
                    let data = null;
                    let error = null;
                    try { 
                        data = _data ? JSON.parse(_data) : {}; 
                    } catch (e) { 
                        error = 'Failed to import, make sure the URL is correct';
                    }
                    res.locals.setResponse(error, { data });
                    next();
                });
            }).on('error', e => {
                res.locals.setResponse(e.message);
                next();
            });
        })();
    };
}

export function getImportScripts(app) {
    return (req, res, next) => {
        const { scriptId } = req.query;
        (async () => {
            const where = { deletedAt: null, };
            if (scriptId) where.script_id = scriptId;
            const scripts = await Script.findAll({ where });
            const data = await Promise.all(scripts.map(s => new Promise((resolve) => {
            (async () => {                
                const screens = await Screen.findAll({ 
                    where: { deletedAt: null, script_id: s.script_id, },
                    order: [['position', 'ASC']],
                });
                const diagnoses = await Diagnosis.findAll({ 
                    where: { deletedAt: null, script_id: s.script_id, }, 
                    order: [['position', 'ASC']],
                });

                delete s.data.id;
                const newScript = await createScript(s.data);

                if (newScript) {
                    const saveScreens = async (_screens = screens, saved = []) => {
                        const s = _screens.shift();
                        try {
                            delete s.data.id;
                            const newScreen = await createScreen({  
                                ...s.data,
                                scriptId: newScript.script_id, 
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
                                scriptId: newScript.script_id, 
                            });
                            if (newScreen) saved.push(newScreen);
                        } catch(e) { /* */ }
                        if (_diagnoses.length) saved = await saveDiagnoses(_diagnoses, saved);
                        return saved;
                    };
                    await saveDiagnoses();
                }

                resolve(newScript);
            })();
            })));
            res.locals.setResponse(null, data);
            next();
        })();
    };
}

