import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.body;

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next();
  };

  Script.create(payload)
    .then((script) => done(null, script))
    .catch(done);
};
