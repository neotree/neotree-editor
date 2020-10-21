import { ConfigKey } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, configKeys) => {
    res.locals.setResponse(err, { configKeys });
    next(); return null;
  };

  ConfigKey.findAll({ where: payload, order: [['position', 'ASC']] })
    .then(configKeys => done(null, configKeys))
    .catch(done);
};
