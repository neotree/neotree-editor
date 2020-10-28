import { Diagnosis, Log } from '../../models';

export const updateDiagnoses = (diagnoses) => new Promise((resolve, reject) =>
  Promise.all(diagnoses.map(({ id, ...d }) =>
    Diagnosis.update({ ...d }, { where: { id }, individualHooks: true }))
  ).then(rslts => {
    resolve(rslts.map(([, d]) => d[0]));
    return null;
  }).catch(reject)
);

export const findAndUpdateDiagnoses = (
  finder = {},
  updater
) =>
  new Promise((resolve, reject) => {
    Diagnosis.findAll(finder).then(diagnoses => {
      diagnoses = updater(JSON.parse(JSON.stringify(diagnoses)));
      updateDiagnoses(diagnoses)
        .then(resolve)
        .catch(reject);
      return null;
    }).catch(reject);
  });

export default app => (req, res, next) => {
  const { diagnoses } = req.body;

  const done = (err, diagnoses = []) => {
    if (diagnoses.length) {
      const ds = diagnoses.map(d => ({ diagnosisId: d.diagnosis_id }));
      app.io.emit('update_diagnoses', { diagnoses: ds });
      Log.create({
        name: 'update_diagnoses',
        data: JSON.stringify({ diagnoses: ds })
      });
    }
    res.locals.setResponse(err, { diagnoses });
    next(); return null;
  };

  updateDiagnoses(diagnoses)
    .then(rslts => done(null, rslts))
    .catch(done);
};
