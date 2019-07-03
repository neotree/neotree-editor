import { Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const { diagnoses, returnUpdated } = req.body;

  const done = (err, payload) => {
    res.locals.setResponse(err, payload);
    next(); return null;
  };

  Promise.all(diagnoses.map(({ id, ...scr }) =>
    Diagnosis.update({ ...scr }, { where: { id } }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, { rslts });

    Diagnosis.findAll({ where: { id: diagnoses.map(scr => scr.id) } })
      .then(diagnoses => done(null, { diagnoses }))
      .catch(done);

    return null;
  }).catch(done);
};
