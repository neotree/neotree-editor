import { ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.body;

  const done = (err, configKey) => {
    res.locals.setResponse(err, { configKey });
    next();
  };

  ConfigKey.create(payload)
    .then((configKey) => done(null, configKey))
    .catch(done);
};
