import firebase from '../../firebase';
import { Diagnosis } from '../../database';

export const copyDiagnosis = (diagnosis) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref(`diagnosis/${diagnosis.script_id}`).push().then(snap => {
      const { data, ...rest } = diagnosis;

      const diagnosisId = snap.key;

      firebase.database()
        .ref(`diagnosis/${diagnosis.script_id}/${diagnosisId}`).set({
          ...rest,
          ...data,
          diagnosisId,
          scriptId: diagnosis.script_id,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          Diagnosis.create({
            ...diagnosis,
            diagnosis_id: diagnosisId,
            data: JSON.stringify(diagnosis.data),
          })
            .then(diagnosis => resolve(diagnosis))
            .catch(err => reject(err));
        })
        .catch(reject);
    })
    .catch(reject);
  });
};

export default app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, diagnosis) => {
    if (diagnosis) app.io.emit('create_diagnoses', { key: app.getRandomString(), diagnoses: [{ id: diagnosis.id }] });
    res.locals.setResponse(err, { diagnosis });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required diagnosis "id" is not provided.' });

  Promise.all([
    Diagnosis.findOne({ where: { id } }),
  ])
    .then(([diagnosis]) => {
      if (!diagnosis) return done({ msg: `Could not find diagnosis with "id" ${id}.` });

      diagnosis = diagnosis.toJSON();

      copyDiagnosis(diagnosis)
        .then(diagnosis => done(null, diagnosis))
        .catch(done);

      return null;
    })
    .catch(done);
};
