import { ConfigKey } from '../../models';

module.exports = app => (req, res, next) => {
  const { configKeys, returnUpdated } = req.body;

  const done = (err, payload) => {
    if (!err) app.io.emit('updateconfig_keys', { config_keys: configKeys.map(c => ({ id: c.id })) });
    res.locals.setResponse(err, payload);
    next(); return null;
  };

  Promise.all(configKeys.map(({ id, ...scr }) =>
    ConfigKey.update({ ...scr }, { where: { id }, individualHooks: true }))
  ).then(rslts => {
    if (!returnUpdated) return done(null, { rslts });

    ConfigKey.findAll({ where: { id: configKeys.map(scr => scr.id) } })
      .then(configKeys => done(null, { configKeys }))
      .catch(done);

    return null;
  }).catch(done);
};
