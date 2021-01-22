import firebase from '../../firebase';
import { Diagnosis } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId, ...payload } = req.body;

    const done = (err, diagnosis) => {
      res.locals.setResponse(err, { diagnosis });
      next();
    };

    let diagnosisId = null;
    try {
      const snap = await firebase.database().ref(`diagnosis/${scriptId}`).push();
      diagnosisId = snap.key;
    } catch (e) { return done(e); }

    let diagnosesCount = 0;
    try {
      diagnosesCount = await Diagnosis.count({ where: { script_id: scriptId, deletedAt: null } });
    } catch (e) { /* Do nothing */ }

    let diagnosis = {
      ...payload,
      diagnosisId,
      scriptId,
      position: diagnosesCount + 1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    try {
      const rslts = await Diagnosis.findOrCreate({
        where: { diagnosis_id: diagnosis.diagnosisId },
        defaults: {
          script_id: scriptId,
          diagnosis_id: diagnosis.diagnosisId,
          position: diagnosis.position,
          type: diagnosis.type,
          data: JSON.stringify(diagnosis),
        }
      });
      if (rslts && rslts[0]) {
        const { data, ...s } = rslts[0];
        diagnosis = { ...data, ...s };
      }
    } catch (e) { return done(e); }

    done(null, diagnosis);
  })();
};
