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
        [key]: { ...screens[key], scriptId, }
      }), {});

      diagnosis = Object.keys(diagnosis).reduce((acc, key) => ({
        ...acc,
        [key]: { ...diagnosis[key], scriptId, }
      }), {});

      try {
        await firebase.database().ref(`scripts/${scriptId}`).set({
          ...script,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      } catch (e) { return reject(e); }

      try {
        await firebase.database().ref(`screens/${scriptId}`).set({
          ...screens,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      } catch (e) { /* do nothing */ }

      try {
        await firebase.database().ref(`diagnosis/${scriptId}`).set({
          ...diagnosis,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
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

      try {
        await Promise.all(Object.keys(screens).map(key => {
          const screen = screens[key];
          return Screen.findOrCreate({
            where: { screen_id: screen.screenId },
            defaults: {
              screen_id: screen.screenId,
              script_id: screen.scriptId,
              type: screen.type,
              position: screen.position,
              data: JSON.stringify(screen),
            }
          });
        }));
      } catch (e) { /* Do nothing */ }

      try {
        await Promise.all(Object.keys(diagnosis).map(key => {
          const d = diagnosis[key];
          return Diagnosis.findOrCreate({
            where: { diagnosis_id: d.diagnosisId },
            defaults: {
              diagnosis_id: d.diagnosisId,
              script_id: d.scriptId,
              position: d.position,
              data: JSON.stringify(d),
            }
          });
        }));
      } catch (e) { /* Do nothing */ }

      resolve(script);
    })();
  });
};

export default (app) => (req, res, next) => {
  (async () => {
    const { scripts } = req.body;

    const done = (err, rslts = []) => {
      if (rslts.length) {
        app.io.emit('create_scripts', { key: app.getRandomString(), scripts });
        Log.create({
          name: 'create_scripts',
          data: JSON.stringify({ scripts })
        });
      }
      res.locals.setResponse(err, { scripts: rslts });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(scripts.map(s => copyScript(s)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
