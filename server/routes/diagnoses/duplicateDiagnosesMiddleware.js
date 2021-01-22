import firebase from '../../firebase';
import { Diagnosis } from '../../database/models';

export const copyDiagnosis = ({ id }) => {
  return new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Required diagnosis "id" is not provided.'));

    (async () => {
      let diagnosisId = null;
      try {
        const snap = await firebase.database().ref('diagnoses').push();
        diagnosisId = snap.key;
      } catch (e) { return reject(e); }

      let diagnosis = null;
      try {
        diagnosis = await Diagnosis.findOne({ where: { id } });
      } catch (e) { /* Do nothing */ }

      if (!diagnosis) return reject(new Error(`Diagnosis with id "${id}" not found`));

      diagnosis = JSON.parse(JSON.stringify(diagnosis));

      let diagnosesCount = 0;
      try {
        diagnosesCount = await Diagnosis.count({ where: {} });
      } catch (e) { /* Do nothing */ }

      delete diagnosis.id;
      diagnosis = {
        ...diagnosis,
        diagnosis_id: diagnosisId,
        position: diagnosesCount + 1,
        data: JSON.stringify({
          ...diagnosis.data,
          diagnosisId,
          position: diagnosesCount + 1,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        }),
      };

      let savedDiagnosis = null;
      try {
        savedDiagnosis = await Diagnosis.findOrCreate({ where: { diagnosis_id: diagnosis.diagnosis_id }, defaults: { ...diagnosis } });
      } catch (e) { return reject(e); }

      resolve(savedDiagnosis);
    })();
  });
};

export default () => (req, res, next) => {
  (async () => {
    const { diagnoses } = req.body;

    const done = async (err, rslts = []) => {
      res.locals.setResponse(err, { diagnoses: rslts });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(diagnoses.map(s => copyDiagnosis(s)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
