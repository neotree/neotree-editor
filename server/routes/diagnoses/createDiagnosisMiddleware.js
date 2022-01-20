import firebase from '../../firebase';
import { Diagnosis } from '../../database';

export async function createDiagnosis(_payload = {}) {
  const { scriptId, ...payload } = _payload;

  let diagnosisId = null;
  try {
    const snap = await firebase.database().ref(`diagnosis/${scriptId}`).push();
    diagnosisId = snap.key;
  } catch (e) { throw e; }

  let diagnosesCount = 0;
  try {
    diagnosesCount = await Diagnosis.count({ where: { script_id: scriptId, deletedAt: null } });
  } catch (e) { /* Do nothing */ }

  let diagnosis = {
    ...payload,
    diagnosisId,
    diagnosis_id: diagnosisId,
    scriptId,
    script_id: scriptId,
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
        // type: diagnosis.type,
        data: JSON.stringify(diagnosis),
      }
    });
    if (rslts && rslts[0]) {
      const { data, ...s } = JSON.parse(JSON.stringify(rslts[0]));
      diagnosis = { ...data, ...s };
    }
  } catch (e) { throw e; }

  return diagnosis;
}

export function createDiagnosisMiddleware() {
  return (req, res, next) => {
    (async () => {  
      const done = (err, diagnosis) => {
        res.locals.setResponse(err, { diagnosis });
        next();
      };
  
      try {
        const d = await createDiagnosis(req.body);
        done(null, d)
      } catch (e) { done (e); }
    })();
  };  
}
