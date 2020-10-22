import firebase from '../../firebase';

export const deleteDiagnosis = ({ scriptId, diagnosisId: id, }) => new Promise((resolve, reject) => {
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
    } catch (e) { /* Do nothing */ }

    try { await firebase.database().ref(`diagnosis/${scriptId}/${id}`).remove(); } catch (e) { return reject(e); }

    resolve(diagnosis);
  })();
});

export default (app) => (req, res, next) => {
  (async () => {
    const { diagnoses } = req.body;

    const done = (err, rslts = []) => {
      if (rslts.length) app.io.emit('delete_diagnoses', { key: app.getRandomString(), diagnoses });
      res.locals.setResponse(err, { diagnoses: rslts });
      next();
    };

    let rslts = null;
    try { rslts = await Promise.all(diagnoses.map(s => deleteDiagnosis(s))); } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
