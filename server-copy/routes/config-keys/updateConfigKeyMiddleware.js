import { ConfigKey } from '../../database';

module.exports = app => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, configKey) => {
    if (!err) app.io.emit('updateconfig_keys', { key: app.getRandomString(), config_keys: [{ id }] });
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required configKey "id" is not provided.' });

  ConfigKey.update(payload, { where: { id }, individualHooks: true })
    .then(rslts => done(null, rslts && rslts[1] ? rslts[1][0] : null))
    .catch(done);
};
