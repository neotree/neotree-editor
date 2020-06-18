import { ConfigKey } from '../../models';

module.exports = app => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, configKey) => {
    if (!err) app.io.emit('update_config_keys', { config_keys: [{ id }] });
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required configKey "id" is not provided.' });

  ConfigKey.update(payload, { where: { id }, individualHooks: true })
    .then(configKey => done(null, configKey))
    .catch(done);
};
