import { v4 } from 'uuidv4';
import { Script, Diagnosis, Screen } from '../../database/models';

export const copyScript = ({ id }) => {
  return new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Required script "id" is not provided.'));

    (async () => {
      let scriptId = null;
      try {
        const snap = await firebase.database().ref('scripts').push();
        scriptId = snap.key;
      } catch (e) { return reject(e); }

      let script = null;
      try {
        script = await Script.findOne({ where: { id } });
      } catch (e) { /* Do nothing */ }

      if (!script) return reject(new Error(`Script with id "${id}" not found`));

      script = JSON.parse(JSON.stringify(script));

      let scriptsCount = 0;
      try {
        scriptsCount = await Script.count({ where: {} });
      } catch (e) { /* Do nothing */ }

      let screens = [];
      try {
        screens = await Screen.findAll({ where: { script_id: script.script_id, deletedAt: null }, order: [['position', 'ASC']] });
        const snaps = await Promise.all(screens.map(() => firebase.database().ref(`screens/${scriptId}`).push()));
        screens = screens.map((s, i) => {
          s = JSON.parse(JSON.stringify(s));
          delete s.id;
          return {
            ...s,
            script_id: scriptId,
            screen_id: snaps[i].key,
            data: JSON.stringify({
              ...s.data,
              scriptId,
              screenId: snaps[i].key,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
            }),
          };
        });
      } catch (e) { /* Do nothing */ }

      let diagnoses = [];
      try {
        diagnoses = await Diagnosis.findAll({ where: { script_id: script.script_id, deletedAt: null }, order: [['position', 'ASC']] });
        const snaps = await Promise.all(diagnoses.map(() => firebase.database().ref(`diagnosis/${scriptId}`).push()));
        diagnoses = diagnoses.map((d, i) => {
          d = JSON.parse(JSON.stringify(d));
          delete d.id;
          return {
            ...d,
            script_id: scriptId,
            diagnosis_id: snaps[i].key,
            data: JSON.stringify({
              ...d.data,
              scriptId,
              diagnosisId: snaps[i].key,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
            }),
          };
        });
      } catch (e) { /* Do nothing */ }

      delete script.id;
      script = {
        ...script,
        script_id: scriptId,
        position: scriptsCount + 1,
        data: JSON.stringify({
          ...script.data,
          scriptId,
          position: scriptsCount + 1,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        }),
      };

      let savedScript = null;
      try {
        savedScript = await Script.findOrCreate({ where: { script_id: script.script_id }, defaults: { ...script } });
      } catch (e) { return reject(e); }

      let savedScreens = [];
      try {
        savedScreens = await Promise.all(screens.map(s => Screen.findOrCreate({ where: { screen_id: s.screen_id }, defaults: { ...s } })));
      } catch (e) { /* Do nothing */ }

      let savedDiagnoses = [];
      try {
        savedDiagnoses = await Promise.all(diagnoses.map(d => Diagnosis.findOrCreate({ where: { diagnosis_id: d.diagnosis_id }, defaults: { ...d } })));
      } catch (e) { /* Do nothing */ }

      resolve({
        script: savedScript,
        diagnoses: savedScreens,
        screens: savedDiagnoses,
      });
    })();
  });
};

export default () => (req, res, next) => {
  (async () => {
    const { scripts } = req.body;

    const done = async (err, rslts = []) => {
      res.locals.setResponse(err, { scripts: rslts.map(({ script }) => script) });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(scripts.map(s => copyScript(s)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
