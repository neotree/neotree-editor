import { Diagnosis } from '../../database';
import firebase from '../../database/firebase';

module.exports = app => (req, res, next) => {
  const payload = req.body;

  const done = (err, items) => {
    if (err) app.logger.log(err);
    if (items.length) app.io.emit('create_diagnoses', { key: app.getRandomString(), diagnoses: items.map(s => ({ id: s.id })) });
    res.locals.setResponse(err, { items });
    next(); return null;
  };

  const saveToFirebase = payload => new Promise((resolve, reject) => {
    firebase.database().ref(`diagnosis/${payload.script_id}`).push().then(snap => {
      const { data: { position, ...data }, ...rest } = payload; // eslint-disable-line

      const diagnosisId = snap.key;

      const diagnosis = {
        ...rest,
        ...data,
        diagnosisId,
        scriptId: payload.script_id,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };

      firebase.database()
        .ref(`diagnosis/${payload.script_id}/${diagnosisId}`).set(diagnosis).then(() => {
          resolve({
            ...rest,
            diagnosis_id: diagnosisId,
            data: JSON.stringify(diagnosis)
          });
        })
        .catch(reject);
    })
    .catch(reject);
  });

  Promise.all([
    Diagnosis.count({ where: { script_id: payload.script_id } }),
    Diagnosis.findAll({ where: { id: payload.ids } })
  ])
    .then(([count, diagnoses]) => {
      Promise.all(diagnoses.map((diagnosis, i) => {
        diagnosis = JSON.parse(JSON.stringify(diagnosis));
        const { createdAt, updateAt, id, diagnosis_id, ...d } = diagnosis; // eslint-disable-line
        return saveToFirebase({
          ...d,
          position: count + (i + 1),
          script_id: payload.script_id
        });
      }))
      .then(items =>
        Promise.all(items.map(item => Diagnosis.create({ ...item })))
          .then(items => {
            return done(null, items);
          })
          .catch(done)
      ).catch(done);
    })
    .catch(done);
};
