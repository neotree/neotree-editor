import firebase from '../../firebase';

export const copyDiagnosis = ({ scriptId, diagnosisId: id, }) => {
  return new Promise((resolve, reject) => {
    (async () => {
      if (!scriptId) return reject(new Error('Required script "id" is not provided.'));

      if (!id) return reject(new Error('Required diagnosis "id" is not provided.'));

      let diagnosisId = null;
      try {
        const snap = await firebase.database().ref('diagnoses').push();
        diagnosisId = snap.key;
      } catch (e) { return reject(e); }

      let diagnosis = null;
      try {
        diagnosis = await new Promise((resolve) => {
          firebase.database()
            .ref(`diagnosis/${scriptId}/${id}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { /* Do nothing */ }

      if (!diagnosis) return reject(new Error(`Diagnosis with id "${id}" not found`));

      let diagnoses = {};
      try {
        diagnoses = await new Promise((resolve) => {
          firebase.database()
            .ref(`diagnosis/${scriptId}`)
            .on('value', snap => resolve(snap.val()));
        });
        diagnoses = diagnoses || {};
      } catch (e) { /* Do nothing */ }

      diagnosis = { ...diagnosis, diagnosisId, id: diagnosisId, position: Object.keys(diagnoses).length + 1, };

      try {
        await firebase.database().ref(`diagnosis/${scriptId}/${diagnosisId}`).set({
          ...diagnosis,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          // updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      } catch (e) { return reject(e); }

      resolve(diagnosis);
    })();
  });
};

export default (app) => (req, res, next) => {
  (async () => {
    const { diagnoses } = req.body;

    const done = (err, _diagnoses = []) => {
      if (_diagnoses.length) app.io.emit('create_diagnoses', { key: app.getRandomString(), diagnoses });
      res.locals.setResponse(err, { diagnoses: _diagnoses });
      next();
    };

    let _diagnoses = [];
    try {
      _diagnoses = await Promise.all(diagnoses.map(s => copyDiagnosis(s)));
    } catch (e) { return done(e); }

    done(null, _diagnoses);
  })();
};
