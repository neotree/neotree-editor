import firebase from '../../firebase';

export const updateConfigKey = ({ configKeyId: id, ...payload }) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required configKey "id" is not provided.'));

    let configKey = null;
    try {
      configKey = await new Promise((resolve) => {
        firebase.database()
          .ref(`configkeys/${id}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return reject(e); }

    if (!configKey) return reject(new Error(`ConfigKey with id "${id}" not found`));

    configKey = { ...configKey, ...payload, id, updatedAt: firebase.database.ServerValue.TIMESTAMP, };

    try { await firebase.database().ref(`configkeys/${id}`).set(configKey); } catch (e) { return reject(e); }

    resolve(configKey);
  })();
});

export default (app) => (req, res, next) => {
  (async () => {
    const done = (err, configKey) => {
      if (configKey) app.io.emit('update_config_keys', { key: app.getRandomString(), configKeys: [{ configKeyId: configKey.configKeyId }] });
      res.locals.setResponse(err, { configKey });
      next();
    };

    let configKey = null;
    try { configKey = await updateConfigKey(req.body); } catch (e) { return done(e); }

    done(null, configKey);
  })();
};
