import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  Script.findOne({ where: { ...payload } })
    .then(script => done(null, { script }))
    .catch(done);
};
