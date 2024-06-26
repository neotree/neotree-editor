import { v4 } from 'uuidv4';
import { Diagnosis } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { items, targetScriptId: scriptId } = req.body;

    const done = (err, items = []) => {
      res.locals.setResponse(err, { items });
      next();
    };

    let diagnosesCount = 0;
    try {
      diagnosesCount = await Diagnosis.count({ where: { script_id: scriptId, deletedAt: null } });
    } catch (e) { /* Do nothing */ }

    let diagnoses = [];
    try {
      diagnoses = await Diagnosis.findAll({ where: { id: items.map(s => s.id) } });
      diagnoses = diagnoses.map((dignosis, i) => {
        const { id, createdAt, updatedAt, data, ...d } = JSON.parse(JSON.stringify(dignosis)); // eslint-disable-line
        const diagnosisId = v4();
        return {
          ...d,
          diagnosis_id: diagnosisId,
          script_id: scriptId,
          position: diagnosesCount + 1,
          data: JSON.stringify({
            ...data,
            scriptId,
            script_id: scriptId,
            diagnosisId: diagnosisId,
            diagnosis_id: diagnosisId,
            position: diagnosesCount + 1,
          }),
        };
      });
    } catch (e) { return done(e); }

    try {
      const rslts = await Promise.all(diagnoses.map(diagnosis => {
        return Diagnosis.findOrCreate({
          where: { diagnosis_id: diagnosis.diagnosis_id },
          defaults: { ...diagnosis }
        });
      }));
      diagnoses = rslts.map(rslt => {
        const { data, ...diagnosis } = JSON.parse(JSON.stringify(rslt[0]));
        return { ...data, ...diagnosis };
      });
    } catch (e) { /* Do nothing */ }

    done(null, diagnoses);
  })();
};
