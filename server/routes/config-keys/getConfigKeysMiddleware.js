import { ConfigKey } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const done = (err, configKeys) => {
      res.locals.setResponse(err, { configKeys });
      next();
    };

    let configKeys = [];
    try {
      configKeys = await ConfigKey.findAll({ where: { deletedAt: null }, order: [['position', 'ASC']], });
      configKeys = configKeys.map(configKey => {
        const { data, ...s } = JSON.parse(JSON.stringify(configKey));
        return { ...data, ...s };
      });
    } catch (e) { return done(e); }

    done(null, configKeys);
  })();
};
