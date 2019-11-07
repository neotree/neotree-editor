import { Diagnosis } from '../../models';
import firebase from '../../firebase';

module.exports = app => (req, res, next) => {
  const payload = req.body;

  const done = (err, items) => {
    if (err) app.logger.log(err);
    res.locals.setResponse(err, { items });
    next(); return null;
  };

  const saveToFirebase = payload => new Promise((resolve, reject) => {
    firebase.database().ref(`diagnosis/${payload.script_id}`).push().then(snap => {
      const { data, ...rest } = payload;

      const diagnosisId = snap.key;

      const diagnosis = {
        ...rest,
        ...data,
        diagnosisId,
        scriptId: payload.script_id,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };

      firebase.database()
        .ref(`diagnoses/${payload.script_id}/${diagnosisId}`).set(diagnosis).then(() => {
          resolve({
            ...rest,
            id: diagnosisId,
            data: JSON.stringify(diagnosis)
          });
        })
        .catch(reject);
    })
    .catch(reject);
  });

  Diagnosis.findAll({ where: { id: payload.ids } })
    .then(diagnoses => {
      Promise.all(diagnoses.map(diagnosis => {
        diagnosis = JSON.parse(JSON.stringify(diagnosis));
        const { createdAt, updateAt, id, ...scr } = diagnosis; // eslint-disable-line
        return saveToFirebase({ ...scr, script_id: payload.script_id });
      }))
      .then(items =>
        Promise.all(items.map((item, i) => Diagnosis.create({
          ...item,
          position: i + 1
        })))
          .then(items => {
            return done(null, items);
          })
          .catch(done)
      ).catch(done);
    })
    .catch(done);
};
