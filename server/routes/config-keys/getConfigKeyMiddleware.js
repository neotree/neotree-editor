import { ConfigKey } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { configKeyId } = req.query;

    const done = (err, configKey) => {
      res.locals.setResponse(err, { configKey });
      next();
    };

    let configKey = null;
    try {
      configKey = await ConfigKey.findOne({ where: { config_key_id: configKeyId } });
      if (configKey) {
        const { data, ...s } = JSON.parse(JSON.stringify(configKey));
        configKey = { ...data, ...s };
      }
    } catch (e) { return done(e); }

    done(null, configKey);
  })();
};
