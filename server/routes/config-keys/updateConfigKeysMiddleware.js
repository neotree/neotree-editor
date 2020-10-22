import { updateConfigKey } from './updateConfigKeyMiddleware';

module.exports = (app) => (req, res, next) => {
  (async () => {
    const { configKeys } = req.body;

    const done = (err, updatedConfigKeys) => {
      if (err) {
        res.locals.setResponse(err);
        return next();
      }
      app.io.emit('update_config_keys', { key: app.getRandomString(), configKeys: configKeys.map(s => ({ configKeyId: s.configKeyId })) });
      res.locals.setResponse(null, { updatedConfigKeys });
      next();
    };

    let updatedConfigKeys = [];
    try { updatedConfigKeys = await Promise.all(configKeys.map(s => updateConfigKey(s))); } catch (e) { return done(e); }

    done(null, updatedConfigKeys);
  })();
};
