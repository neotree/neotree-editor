import { Diagnosis } from '../../database';

export const updateDiagnoses = (diagnoses, returnUpdated = false) => new Promise((resolve, reject) =>
  Promise.all(diagnoses.map(({ id, ...d }) =>
    Diagnosis.update({ ...d }, { where: { id }, individualHooks: true }))
  ).then(rslts => {
    if (!returnUpdated) return resolve({ rslts });

    Diagnosis.findAll({ where: { id: diagnoses.map(d => d.id) }, order: [['position', 'ASC']] })
      .then(diagnoses => resolve({ diagnoses }))
      .catch(reject);

    return null;
  }).catch(reject)
);

export const findAndUpdateDiagnoses = (
  finder = {},
  updater,
  returnUpdated = false
) =>
  new Promise((resolve, reject) => {
    Diagnosis.findAll(finder).then(diagnoses => {
      diagnoses = updater(JSON.parse(JSON.stringify(diagnoses)));
      updateDiagnoses(diagnoses, returnUpdated)
        .then(resolve)
        .catch(reject);
      return null;
    }).catch(reject);
  });

export default app => (req, res, next) => {
  const { diagnoses, returnUpdated } = req.body;

  const done = (err, payload) => {
    app.io.emit('update_diagnoses', { key: app.getRandomString(), diagnoses: diagnoses.map(s => ({ id: s.id })) });
    res.locals.setResponse(err, payload);
    next(); return null;
  };

  updateDiagnoses(diagnoses, returnUpdated)
    .then(payload => done(null, payload))
    .catch(done);
};
