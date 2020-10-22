import firebase from '../../firebase';

export const copyConfigKey = ({ configKeyId: id }) => {
  return new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Required configKey "id" is not provided.'));

    (async () => {
      let configKeyId = null;
      try {
        const snap = await firebase.database().ref('configkeys').push();
        configKeyId = snap.key;
      } catch (e) { return reject(e); }

      let configKey = null;
      try {
        configKey = await new Promise((resolve) => {
          firebase.database()
            .ref(`configkeys/${id}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { /* Do nothing */ }

      if (!configKey) return reject(new Error(`ConfigKey with id "${id}" not found`));

      let configKeys = {};
      try {
        configKeys = await new Promise((resolve) => {
          firebase.database()
            .ref('configkeys')
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { /* Do nothing */ }

      configKey = { ...configKey, configKeyId, id: configKeyId, position: Object.keys(configKeys).length + 1, };

      try {
        await firebase.database().ref(`configkeys/${configKeyId}`).set({
          ...configKey,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        });
      } catch (e) { return reject(e); }

      resolve(configKey);
    })();
  });
};

export default (app) => (req, res, next) => {
  (async () => {
    const { configKeys } = req.body;

    const done = (err, rslts = []) => {
      if (rslts.length) app.io.emit('create_config_keys', { key: app.getRandomString(), configKeys });
      res.locals.setResponse(err, { configKeys: rslts });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(configKeys.map(s => copyConfigKey(s)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
