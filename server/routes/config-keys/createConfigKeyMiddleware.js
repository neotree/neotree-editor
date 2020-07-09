import { ConfigKey } from '../../models';
import firebase from '../../firebase';

module.exports = app => (req, res, next) => {
  const payload = req.body;

  const done = (err, configKey) => {
    if (configKey) app.io.emit('createconfig_keys', { config_keys: [{ id: configKey.id }] });
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  const saveToFirebase = () => new Promise((resolve, reject) => {
    firebase.database().ref('configkeys').push().then(snap => {
      const { data, ...rest } = payload;

      const configKeyId = snap.key;

      const _data = data ? JSON.parse(data) : null;

      firebase.database()
        .ref(`configkeys/${configKeyId}`).set({
          ...rest,
          ..._data,
          configKeyId,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          resolve(configKeyId);
        })
        .catch(reject);
    })
    .catch(reject);
  });

  Promise.all([
    ConfigKey.count({ where: {} }),
    saveToFirebase(),
  ])
    .then(([count, id]) => {
      ConfigKey.create({ ...payload, position: count + 1, id })
        .then((configKey) => done(null, configKey))
        .catch(done);
    }).catch(done);
};
