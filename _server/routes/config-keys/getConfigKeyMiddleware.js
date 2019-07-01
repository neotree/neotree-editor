import { ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  const done = (err, configKey) => {
    res.locals.setResponse(err, { configKey });
    next();
  };

  ConfigKey.findOne({ where: payload })
    .then((configKey) => done(null, configKey))
    .catch(done);
};
