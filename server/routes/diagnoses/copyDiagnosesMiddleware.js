import firebase from '../../firebase';
import { Diagnosis } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { items, targetScriptId: scriptId } = req.body;

    const done = (err, items = []) => {
      res.locals.setResponse(err, { items });
      next();
    };

    let snaps = [];
    try {
      snaps = await Promise.all(items.map(() => firebase.database().ref(`diagnosis/${scriptId}`).push()));
    } catch (e) { return done(e); }

    let diagnosesCount = 0;
    try {
      diagnosesCount = await Diagnosis.count({ where: { script_id: scriptId, deletedAt: null } });
    } catch (e) { /* Do nothing */ }

    let diagnoses = [];
    try {
      diagnoses = await Diagnosis.findAll({ where: { id: items.map(s => s.id) } });
      diagnoses = diagnoses.map((s, i) => {
        s = JSON.parse(JSON.stringify(s));
        delete s.id;
        return {
          ...s,
          diagnosis_id: snaps[i].key,
          script_id: scriptId,
          position: diagnosesCount + 1,
          data: JSON.stringify({
            ...s.data,
            scriptId,
            diagnosisId: snaps[i].key,
            position: diagnosesCount + 1,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
          }),
        };
      });
    } catch (e) { return done(e); }

    try {
      const rslts = await Promise.all(diagnoses.map(diagnosis => {
        return Diagnosis.findOrCreate({ where: { diagnosis_id: diagnosis.diagnosis_id }, defaults: { ...diagnosis } });
      }));
      diagnoses = rslts.map(rslt => {
        const { data, ...diagnosis } = JSON.parse(JSON.stringify(rslt[0]));
        return { ...data, ...diagnosis };
      });
    } catch (e) { /* Do nothing */ }

    done(null, diagnoses);
  })();
};
