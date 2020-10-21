import { Diagnosis } from '../../database';
import firebase from '../../firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, diagnosis) => {
      if (err) app.logger.log(err);
      if (diagnosis) app.io.emit('create_diagnoses', { key: app.getRandomString(), diagnoses: [{ id: diagnosis.id }] });
      res.locals.setResponse(err, { diagnosis });
      next(); return null;
    };

    let position = 0;
    try { 
      position = await Diagnosis.count({ where: { script_id: payload.script_id } }); 
      position++;
    } catch (e) { return done(e); }

    const saveToFirebase = () => new Promise((resolve, reject) => {
      firebase.database().ref(`diagnosis/${payload.script_id}`).push().then(snap => {
        const { data, ...rest } = payload;

        const diagnosisId = snap.key;

        const _data = data ? JSON.parse(data) : null;

        firebase.database()
          .ref(`diagnosis/${payload.script_id}/${diagnosisId}`).set({
            ...rest,
            ..._data,
            position,
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

    try { 
      const diagnosis_id = await saveToFirebase();
      Diagnosis.create({ ...payload, position, diagnosis_id })
          .then((diagnosis) => done(null, diagnosis))
          .catch(done);
    } catch (e) { done(e); }
  })();
};
