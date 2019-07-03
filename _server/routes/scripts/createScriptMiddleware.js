import { Script } from '../../models';

module.exports = (app, params) => (req, res, next) => {
  const payload = params || req.body;

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  Script.create(payload)
    .then((script) => done(null, script))
    .catch(done);
};
