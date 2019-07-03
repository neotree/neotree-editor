import { ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  const done = (err, configKey) => {
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  ConfigKey.findOne({ where: payload })
    .then((configKey) => done(null, configKey))
    .catch(done);
};
