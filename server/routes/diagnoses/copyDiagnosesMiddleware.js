import firebase from '../../firebase';
import { Diagnosis, Log } from '../../database/models';

module.exports = app => (req, res, next) => {
  (async () => {
    const { items, targetScriptId: scriptId } = req.body;

    const done = (err, items = []) => {
      if (items.length) {
        app.io.emit('create_diagnoses', { key: app.getRandomString(), diagnoses: items.map(s => ({ diagnosisId: s.id, scriptId: s.scriptId, })) });
        Log.create({
          name: 'create_diagnoses',
          data: JSON.stringify({ diagnoses: items.map(s => ({ diagnosisId: s.id, scriptId: s.scriptId, })) })
        });
      }
      res.locals.setResponse(err, { items });
      next();
    };

    const ids = [];
    try {
      const snaps = await Promise.all(items.map(() => firebase.database().ref(`diagnosis/${scriptId}`).push()));
      snaps.forEach(snap => ids.push(snap.key));
    } catch (e) { return done(e); }

    let diagnoses = [];
    try {
      let _diagnoses = await new Promise((resolve) => {
        firebase.database()
          .ref(`diagnosis/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      _diagnoses = _diagnoses || {};
      diagnoses = Object.keys(_diagnoses).map(key => _diagnoses[key]);
      diagnoses = items.map((s, i) => ({
        ...s,
        ..._diagnoses[s.diagnosisId],
        scriptId,
        position: i + diagnoses.length + 1,
        id: ids[i] || s.id,
        diagnosisId: ids[i] || s.id,
      }));
    } catch (e) { return done(e); }

    try {
      await Promise.all(diagnoses.map(s => {
        return firebase.database().ref(`diagnosis/${scriptId}/${s.diagnosisId}`).set({
          ...s,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      }));
    } catch (e) { return done(e); }

    try {
      await Promise.all(diagnoses.map(diagnosis => {
        return Diagnosis.findOrCreate({
          where: { diagnosis_id: diagnosis.diagnosisId },
          defaults: {
            diagnosis_id: diagnosis.diagnosisId,
            script_id: diagnosis.scriptId,
            position: diagnosis.position,
            data: JSON.stringify(diagnosis),
          }
        });
      }));
    } catch (e) { /* Do nothing */ }

    done(null, diagnoses);
  })();
};
