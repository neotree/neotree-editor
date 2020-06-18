import { ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  ConfigKey.findAll({ where: { ...payload } })
    .then(config_keys => done(null, { config_keys }))
    .catch(done);
};
