import { updateConfigKey } from './updateConfigKeyMiddleware';

module.exports = () => (req, res, next) => {
  (async () => {
    const { configKeys } = req.body;

    const done = (err, updatedConfigKeys) => {
      if (err) {
        res.locals.setResponse(err);
        return next();
      }
      res.locals.setResponse(null, { updatedConfigKeys });
      next();
    };

    let updatedConfigKeys = [];
    try { updatedConfigKeys = await Promise.all(configKeys.map(s => updateConfigKey(s))); } catch (e) { return done(e); }

    done(null, updatedConfigKeys);
  })();
};
