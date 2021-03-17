import { Hospital } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = res.locals.reqQuery;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Hospital.findAll({ where: { deletedAt: null, ...payload } })
    .then(hospitals => done(null, { hospitals }))
    .catch(done);
};
