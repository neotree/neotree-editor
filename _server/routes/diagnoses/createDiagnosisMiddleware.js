import { Diagnosis } from '../../models';
import firebase, { sanitizeDataForFirebase } from '../../firebase';

module.exports = () => (req, res, next) => {
  const payload = req.body;

  const done = (err, diagnosis) => {
    res.locals.setResponse(err, { diagnosis });
    next(); return null;
  };

  const saveToFirebase = () => new Promise((resolve, reject) => {
    firebase.database().ref(`diagnosis/${payload.script_id}`).push().then(snap => {
      const { data, ...rest } = payload;

      const diagnosisId = snap.key;

      resolve(diagnosisId);

      const _data = data ? JSON.parse(data) : null;
      firebase.database()
        .ref(`diagnosis/${payload.script_id}`).child(diagnosisId).update(sanitizeDataForFirebase({
          ...rest,
          ..._data,
          diagnosisId,
          scriptId: payload.script_id
        }));
    })
    .catch(reject);
  });

  saveToFirebase()
    .then(id => {
      Diagnosis.create({ ...payload, id })
        .then((diagnosis) => done(null, diagnosis))
        .catch(done);
    }).catch(done);
};
