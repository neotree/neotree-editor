import { ConfigKey } from '../../database';
import firebase from '../../database/firebase';

export const copyConfigKey = (configKey) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref('configkeys').push().then(snap => {
      const { data, ...rest } = configKey;

      const configKeyId = snap.key;

      firebase.database()
        .ref(`configkeys/${configKeyId}`).set({
          ...rest,
          ...data,
          configKeyId,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          ConfigKey.create({
            ...configKey,
            id: configKeyId,
            data: JSON.stringify(configKey.data),
          })
            .then(configKey => resolve(configKey))
            .catch(reject);
        })
        .catch(reject);
    })
    .catch(reject);
  });
};

export default app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, configKey) => {
    if (configKey) app.io.emit('create_config_keys', { key: app.getRandomString(), config_keys: [{ id: configKey.id }] });
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required configKey "id" is not provided.' });

  Promise.all([
    ConfigKey.findOne({ where: { id } }),
  ])
    .then(([configKey]) => {
      if (!configKey) return done({ msg: `Could not find configKey with "id" ${id}.` });

      configKey = configKey.toJSON();

      copyConfigKey(configKey)
        .then(configKey => done(null, configKey))
        .catch(done);

      return null;
    })
    .catch(done);
};
