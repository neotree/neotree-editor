import { Diagnosis } from '../../models';

module.exports = app => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, diagnosis) => {
    if (diagnosis) app.io.emit('update_diagnoses', { key: app.getRandomString(), diagnoses: [{ id }] });
    res.locals.setResponse(err, { diagnosis });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required diagnosis "id" is not provided.' });

  Diagnosis.update(payload, { where: { id }, individualHooks: true })
    .then(rslts => done(null, rslts && rslts[1] ? rslts[1][0] : null))
    .catch(done);
};
