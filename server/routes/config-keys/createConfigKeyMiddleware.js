import { v4 } from 'uuidv4';
import { ConfigKey, } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, configKey) => {
      res.locals.setResponse(err, { configKey });
      next();
    };

    let configKeyId = v4();

    let configKeysCount = 0;
    try {
      configKeysCount = await ConfigKey.count({ where: {} });
    } catch (e) { /* Do nothing */ }

    let configKey = {
      ...payload,
      configKeyId,
      position: configKeysCount + 1,
    };

    try {
      const rslts = await ConfigKey.findOrCreate({
        where: { config_key_id: configKey.configKeyId },
        defaults: {
          position: configKey.position,
          data: JSON.stringify(configKey),
        }
      });
      if (rslts && rslts[0]) {
        const { data, ...s } = JSON.parse(JSON.stringify(rslts[0]));
        configKey = { ...data, ...s };
      }
    } catch (e) { return done(e); }

    done(null, configKey);
  })();
};
