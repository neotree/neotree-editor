import { ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (err, configKeys) => {
    res.locals.setResponse(err, { configKeys });
    next(); return null;
  };

  ConfigKey.findAll({ where: payload })
    .then(configKeys => done(null, configKeys))
    .catch(done);
};
