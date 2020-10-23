import firebase from '../../firebase';
import { Diagnosis, Log } from '../../database/models';

export const updateDiagnosis = ({ diagnosisId: id, scriptId, ...payload }) => new Promise((resolve, reject) => {
  (async () => {
    if (!scriptId) return reject(new Error('Required script "id" is not provided.'));

    if (!id) return reject(new Error('Required diagnosis "id" is not provided.'));

    let diagnosis = null;
    try {
      diagnosis = await new Promise((resolve) => {
        firebase.database()
          .ref(`diagnosis/${scriptId}/${id}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return reject(e); }

    if (!diagnosis) return reject(new Error(`Diagnosis with id "${id}" not found`));

    diagnosis = { ...diagnosis, ...payload, id, updatedAt: firebase.database.ServerValue.TIMESTAMP, };

    try { await firebase.database().ref(`diagnosis/${scriptId}/${id}`).set(diagnosis); } catch (e) { return reject(e); }

    try {
      await Diagnosis.update(
        {
          position: diagnosis.position,
          data: JSON.stringify(diagnosis),
        },
        { where: { diagnosis_id: diagnosis.diagnosisId } }
      );
    } catch (e) { /* Do nothing */ }

    resolve(diagnosis);
  })();
});

export default (app) => (req, res, next) => {
  (async () => {
    const done = (err, diagnosis) => {
      if (diagnosis) {
        app.io.emit('update_diagnoses', { key: app.getRandomString(), diagnoses: [{ diagnosisId: diagnosis.diagnosisId }] });
        Log.create({
          name: 'update_diagnoses',
          data: JSON.stringify({ diagnoses: [{ diagnosisId: diagnosis.diagnosisId }] })
        });
      }
      res.locals.setResponse(err, { diagnosis });
      next();
    };

    let diagnosis = null;
    try { diagnosis = await updateDiagnosis(req.body); } catch (e) { return done(e); }

    done(null, diagnosis);
  })();
};
