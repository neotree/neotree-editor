import { ConfigKey } from '../../database/models';

export const updateConfigKey = ({ id, ...payload }) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required configKey "id" is not provided.'));

    let configKey = null;
    try {
      configKey = await ConfigKey.findOne({ where: { id } });
    } catch (e) { return reject(e); }

    if (!configKey) return reject(new Error(`ConfigKey with id "${id}" not found`));

    try {
      await ConfigKey.update(
        {
          position: payload.position || configKey.position,
          data: JSON.stringify({ ...configKey.data, ...payload }),
        },
        { where: { id, deletedAt: null } }
      );
    } catch (e) { /* Do nothing */ }

    resolve(configKey);
  })();
});

export default () => (req, res, next) => {
  (async () => {
    const done = (err, configKey) => {
      res.locals.setResponse(err, { configKey });
      next();
    };

    let configKey = null;
    try { configKey = await updateConfigKey(req.body); } catch (e) { return done(e); }

    done(null, configKey);
  })();
};
