import { ConfigKey } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = res.locals.reqQuery;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  ConfigKey.findAll({ where: { ...payload } })
    .then(config_keys => done(null, { config_keys }))
    .catch(done);
};
