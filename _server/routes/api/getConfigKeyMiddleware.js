import { ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (e, payload) => {
    res.locals.setResponse(e, payload);
    next();
  };

  ConfigKey.findOne({ where: { ...payload } })
    .then(config_key => done(null, { config_key }))
    .catch(done);
};
