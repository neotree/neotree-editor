import firebase from '../../firebase';
import { Diagnosis, Log } from '../../database/models';

module.exports = app => (req, res, next) => {
  (async () => {
    const { scriptId, ...payload } = req.body;

    const done = (err, diagnosis) => {
      if (diagnosis) {
        app.io.emit('create_diagnoses', { key: app.getRandomString(), diagnoses: [{ diagnosisId: diagnosis.id, scriptId }] });
        Log.create({
          name: 'create_diagnoses',
          data: JSON.stringify({ diagnoses: [{ diagnosisId: diagnosis.id, scriptId }] })
        });
      }
      res.locals.setResponse(err, { diagnosis });
      next();
    };

    if (!scriptId) return done(new Error('Required script "id" is not provided.'));

    let diagnosisId = null;
    try {
      const snap = await firebase.database().ref(`diagnosis/${scriptId}`).push();
      diagnosisId = snap.key;
    } catch (e) { return done(e); }

    let diagnoses = {};
    try {
      diagnoses = await new Promise((resolve) => {
        firebase.database()
          .ref(`diagnosis/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      diagnoses = diagnoses || {};
    } catch (e) { /* Do nothing */ }

    const diagnosis = {
      ...payload,
      scriptId,
      diagnosisId,
      id: diagnosisId,
      position: Object.keys(diagnoses).length + 1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    try { await firebase.database().ref(`diagnosis/${scriptId}/${diagnosisId}`).set(diagnosis); } catch (e) { return done(e); }

    try {
      await Diagnosis.findOrCreate({
        where: { diagnosis_id: diagnosis.diagnosisId },
        defaults: {
          diagnosis_id: diagnosis.diagnosisId,
          script_id: diagnosis.scriptId,
          position: diagnosis.position,
          data: JSON.stringify(diagnosis),
        }
      });
    } catch (e) { /* Do nothing */ }

    done(null, diagnosis);
  })();
};
