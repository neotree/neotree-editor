import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, configKey) => {
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

    done(null, configKey);
  })();
};
