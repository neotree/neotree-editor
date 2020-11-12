import { Diagnosis } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = res.locals.reqQuery;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Diagnosis.findOne({ where: { ...payload } })
    .then(diagnosis => done(null, { diagnosis }))
    .catch(done);
};
