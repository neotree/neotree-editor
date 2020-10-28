import { Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Diagnosis.findOne({ where: { ...payload } })
    .then(diagnosis => done(null, { diagnosis }))
    .catch(done);
};
