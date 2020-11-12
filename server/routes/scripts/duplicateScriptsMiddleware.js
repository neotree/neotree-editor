import firebase from '../../firebase';
import { Script, Diagnosis, Screen, Log } from '../../database/models';

export const copyScript = ({ scriptId: id }) => {
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
        script = await new Promise((resolve) => {
          firebase.database()
            .ref(`scripts/${id}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { /* Do nothing */ }

      if (!script) return reject(new Error(`Script with id "${id}" not found`));

      let scripts = {};
      try {
        scripts = await new Promise((resolve) => {
          firebase.database()
            .ref('scripts')
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { /* Do nothing */ }

      let screens = {};
      try {
        screens = await new Promise((resolve) => {
          firebase.database()
            .ref(`screens/${id}`)
            .on('value', snap => resolve(snap.val()));
        });
        screens = screens || {};
      } catch (e) { /* Do nothing */ }

      let diagnosis = {};
      try {
        diagnosis = await new Promise((resolve) => {
          firebase.database()
            .ref(`diagnosis/${id}`)
            .on('value', snap => resolve(snap.val()));
        });
        diagnosis = diagnosis || {};
      } catch (e) { /* Do nothing */ }

      script = { ...script, scriptId, id: scriptId, position: Object.keys(scripts).length + 1, };

      screens = Object.keys(screens).reduce((acc, key) => ({
        ...acc,
        [key]: {
          ...screens[key],
          scriptId,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        }
      }), {});

      diagnosis = Object.keys(diagnosis).reduce((acc, key) => ({
        ...acc,
        [key]: {
          ...diagnosis[key],
          scriptId,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        }
      }), {});

      const screenIds = [];
      try {
        const snaps = await Promise.all(Object.keys(screens).map(() => firebase.database().ref(`screens/${scriptId}`).push()));
        snaps.forEach(snap => screenIds.push(snap.key));
      } catch (e) { return reject(e); }

      const diagnosesIds = [];
      try {
        const snaps = await Promise.all(Object.keys(diagnosis).map(() => firebase.database().ref(`diagnosis/${scriptId}`).push()));
        snaps.forEach(snap => diagnosesIds.push(snap.key));
      } catch (e) { return reject(e); }

      try {
        await firebase.database().ref(`scripts/${scriptId}`).set({
          ...script,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      } catch (e) { return reject(e); }

      try {
        await firebase.database().ref(`screens/${scriptId}`).set({ ...screens, });
      } catch (e) { /* do nothing */ }

      try {
        await firebase.database().ref(`diagnosis/${scriptId}`).set({ ...diagnosis, });
      } catch (e) { /* do nothing */ }

      try {
        await Script.findOrCreate({
          where: { script_id: script.scriptId },
          defaults: {
            script_id: script.scriptId,
            position: script.position,
            data: JSON.stringify(script),
          }
        });
      } catch (e) { /* Do nothing */ }

      let _screens = [];
      let _diagnoses = [];

      try {
        const savedScreens = await Promise.all(Object.keys(screens).map((key, i) => {
          const screen = screens[key];
          const screen_id = screenIds[i];
          return Screen.findOrCreate({
            where: { screen_id },
            defaults: {
              screen_id,
              script_id: screen.scriptId,
              type: screen.type,
              position: screen.position,
              data: JSON.stringify(screen),
            }
          });
        }));
        _screens = savedScreens.map(rslt => rslt[0]);
      } catch (e) { /* Do nothing */ }

      try {
        const savedDiagnoses = await Promise.all(Object.keys(diagnosis).map((key, i) => {
          const d = diagnosis[key];
          const diagnosis_id = diagnosesIds[i];
          return Diagnosis.findOrCreate({
            where: { diagnosis_id },
            defaults: {
              diagnosis_id,
              script_id: d.scriptId,
              position: d.position,
              data: JSON.stringify(d),
            }
          });
        }));
        _diagnoses = savedDiagnoses.map(rslt => rslt[0]);
      } catch (e) { /* Do nothing */ }

      resolve({ script, diagnoses: _diagnoses, screens: _screens, });
    })();
  });
};

export default (app) => (req, res, next) => {
  (async () => {
    const { scripts } = req.body;

    const done = async (err, rslts = []) => {
      if (rslts.length) {
        const diagnoses = rslts.reduce((acc, { diagnoses }) => [...acc, ...diagnoses.map(d => ({ diagnosisId: d.diagnosis_id, scriptId: d.script_id, }))], []);
        const screens = rslts.reduce((acc, { screens }) => [...acc, ...screens.map(s => ({ screenId: s.screen_id, scriptId: s.script_id, }))], []);

        if (diagnoses.length) {
          Log.create({
            name: 'create_diagnoses',
            data: JSON.stringify({ diagnoses })
          });
          app.io.emit('create_diagnoses', { key: app.getRandomString(), diagnoses });
        }

        if (screens.length) {
          Log.create({
            name: 'create_screens',
            data: JSON.stringify({ screens })
          });
          app.io.emit('create_screens', { key: app.getRandomString(), screens });
        }

        app.io.emit('create_scripts', { key: app.getRandomString(), scripts: rslts.map(({ script }) => ({ scriptId: script.scriptId })) });
        Log.create({
          name: 'create_scripts',
          data: JSON.stringify({ scripts })
        });
      }
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
