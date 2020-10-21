import { ConfigKey } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, configKey) => {
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  ConfigKey.findOne({ where: payload })
    .then((configKey) => done(null, configKey))
    .catch(done);
};
