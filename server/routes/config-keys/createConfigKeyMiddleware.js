import firebase from '../../firebase';
import { ConfigKey, Log } from '../../database/models';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, configKey) => {
      if (configKey) {
        app.io.emit('create_config_keys', { key: app.getRandomString(), configKeys: [{ configKeyId: configKey.configKeyId }], });
        Log.create({
          name: 'create_config_keys',
          data: JSON.stringify({ configKeys: [{ configKeyId: configKey.configKeyId }] })
        });
      }
      res.locals.setResponse(err, { configKey });
      next();
    };

    let configKeyId = null;
    try {
      const snap = await firebase.database().ref('configkeys').push();
      configKeyId = snap.key;
    } catch (e) { return done(e); }

    let configKeys = {};
    try {
      configKeys = await new Promise((resolve) => {
        firebase.database()
          .ref('configkeys')
          .on('value', snap => resolve(snap.val()));
      });
      configKeys = configKeys || {};
    } catch (e) { /* Do nothing */ }

    const configKey = {
      ...payload,
      configKeyId,
      id: configKeyId,
      position: Object.keys(configKeys).length + 1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    try { await firebase.database().ref(`configkeys/${configKeyId}`).set(configKey); } catch (e) { return done(e); }

    try {
      await ConfigKey.findOrCreate({
        where: { config_key_id: configKey.configKeyId },
        defaults: {
          position: configKey.position,
          data: JSON.stringify(configKey),
        }
      });
    } catch (e) { /* Do nothing */ }

    done(null, configKey);
  })();
};
