import { ConfigKey, Log } from '../../models';

module.exports = app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, configKey) => {
    if (!err) {
      app.io.emit('delete_config_keys', { configKeys: [{ configKeyId: id }] });
      Log.create({
        name: 'delete_config_keys',
        data: JSON.stringify({ configKeys: [{ configKeyId: id }] })
      });
    }
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required configKey "id" is not provided.' });

  ConfigKey.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find configKey with "id" ${id}.` });

      s.destroy({ where: { id } })
        .then(deleted => done(null, { deleted }))
        .catch(done);

      return null;
    })
    .catch(done);
};