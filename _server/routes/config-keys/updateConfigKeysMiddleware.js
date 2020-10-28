import { ConfigKey, Log } from '../../models';

module.exports = app => (req, res, next) => {
  const { configKeys, returnUpdated } = req.body;

  const done = (err, payload) => {
    if (!err) {
      app.io.emit('update_config_keys', { configKeys: configKeys.map(c => ({ configKeyId: c.id })) });
      Log.create({
        name: 'update_config_keys',
        data: JSON.stringify({ configKeys: configKeys.map(c => ({ configKeyId: c.id })) })
      });
    }
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
