import { firebaseAdmin } from '../index';
import { ConfigKey, Hospital, Diagnosis, Script, Screen, } from '../../database/models';

export default () => new Promise((resolve, reject) => {
  (async () => {
    const errors = [];
    
    let scripts = [];
    try {
      const countScripts = await Script.count({ where: {} });
      if (!countScripts) {
        console.log('Importing firebase scripts...');
        let rslts = await new Promise(resolve => {
          firebaseAdmin.database().ref('scripts').once('value', snap => resolve(snap.val()));
        });
        rslts = rslts || {};
        scripts = Object.keys(rslts).map(key => rslts[key]);
      }
    } catch (e) { errors.push(e); }

    let screens = [];
    try {
      const countScreens = await Screen.count({ where: {} });
      if (!countScreens) {
        console.log('Importing firebase screens...');
        let rslts = await new Promise(resolve => {
          firebaseAdmin.database().ref('screens').once('value', snap => resolve(snap.val()));
        });
        rslts = rslts || {};
        screens = Object.keys(rslts).reduce((acc, scriptId) => {
          const _screens = rslts[scriptId];
          return [...acc, ...Object.keys(_screens).map(key => _screens[key])];
        }, []);
      }
    } catch (e) { errors.push(e); }

    let diagnoses = [];
    try {
      const countDiagnoses = await Diagnosis.count({ where: {} });
      if (!countDiagnoses) {
        console.log('Importing firebase diagnoses...');
        let rslts = await new Promise(resolve => {
          firebaseAdmin.database().ref('diagnosis').once('value', snap => resolve(snap.val()));
        });
        rslts = rslts || {};
        diagnoses = Object.keys(rslts).reduce((acc, scriptId) => {
          const _diagnoses = rslts[scriptId];
          return [...acc, ...Object.keys(_diagnoses).map(key => _diagnoses[key])];
        }, []);
      }
    } catch (e) { errors.push(e); }

    let hospitals = [];
    try {
      const countHospitals = await Hospital.count({ where: {} });
      if (!countHospitals) {
        console.log('Importing firebase hospitals...');
        let rslts = await new Promise(resolve => {
          firebaseAdmin.database().ref('hospitals').once('value', snap => resolve(snap.val()));
        });
        rslts = rslts || {};
        hospitals = Object.keys(rslts).map(key => rslts[key]);
      }
    } catch (e) { errors.push(e); }

    let configKeys = [];
    try {
      const countConfigKeys = await ConfigKey.count({ where: {} });
      if (!countConfigKeys) {
        console.log('Importing firebase configKeys...');
        let rslts = await new Promise(resolve => {
          firebaseAdmin.database().ref('configkeys').once('value', snap => resolve(snap.val()));
        });
        rslts = rslts || {};
        configKeys = Object.keys(rslts).map(key => rslts[key]);
      }
    } catch (e) { errors.push(e); }

    try {
      await Promise.all([
        ...scripts.map(s => Script.findOrCreate({
          where: { script_id: s.scriptId },
          defaults: {
            position: s.position,
            script_id: s.scriptId,
            data: JSON.stringify(s),
          },
        })),

        ...screens.map(s => Screen.findOrCreate({
          where: { screen_id: s.screenId },
          defaults: {
            type: s.type,
            position: s.position,
            screen_id: s.screenId,
            script_id: s.scriptId,
            data: JSON.stringify(s),
          },
        })),

        ...diagnoses.map(s => Diagnosis.findOrCreate({
          where: { diagnosis_id: s.diagnosisId },
          defaults: {
            position: s.position,
            diagnosis_id: s.diagnosisId,
            script_id: s.scriptId,
            data: JSON.stringify(s),
          },
        })),

        ...configKeys.map(s => ConfigKey.findOrCreate({
          where: { config_key_id: s.configKeyId },
          defaults: {
            position: s.position,
            config_key_id: s.configKeyId,
            data: JSON.stringify(s),
          },
        })),

        ...hospitals.map(s => Hospital.findOrCreate({
          where: { hospital_id: s.hospitalId },
          defaults: {
            hospital_id: s.hospitalId,
            name: s.name,
            country: s.country,
          },
        })),
      ]);
    } catch (e) { errors.push(e); }

    if (errors.length) return reject(errors);

    resolve();
  })();
});
