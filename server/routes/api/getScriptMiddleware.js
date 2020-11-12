import { Script } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = res.locals.reqQuery;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Script.findOne({ where: { ...payload } })
    .then(script => done(null, { script }))
    .catch(done);
};
