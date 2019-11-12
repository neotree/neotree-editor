import { Diagnosis } from '../../models';
import firebase from '../../firebase';

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

      const _data = data ? JSON.parse(data) : null;

      firebase.database()
        .ref(`diagnosis/${payload.script_id}/${diagnosisId}`).set({
          ...rest,
          ..._data,
          diagnosisId,
          scriptId: payload.script_id,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          resolve(diagnosisId);
        })
        .catch(reject);
    })
    .catch(reject);
  });

  Promise.all([
    Diagnosis.count({ where: { script_id: payload.script_id } }),
    saveToFirebase()
  ])
    .then(([position, id]) => {
      Diagnosis.create({ ...payload, position: position || 1, id })
        .then((diagnosis) => done(null, diagnosis))
        .catch(done);
    }).catch(done);
};
