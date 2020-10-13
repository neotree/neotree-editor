import { ConfigKey } from '../../database';
import firebase from '../../database/firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, configKey) => {
      if (configKey) app.io.emit('create_config_keys', { key: app.getRandomString(), config_keys: [{ id: configKey.id }] });
      res.locals.setResponse(err, { configKey });
      next(); return null;
    };

    let position = 0;
    try { 
      position = await ConfigKey.count({ where: {} }); 
      position++;
    } catch (e) { return done(e); }

    const saveToFirebase = () => new Promise((resolve, reject) => {
      firebase.database().ref('configkeys').push().then(snap => {
        const { data, ...rest } = payload;

        const configKeyId = snap.key;

        const _data = data ? JSON.parse(data) : null;

        firebase.database()
          .ref(`configkeys/${configKeyId}`).set({
            ...rest,
            ..._data,
            position,
            configKeyId,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          }).then(() => {
            resolve(configKeyId);
          })
          .catch(reject);
      })
      .catch(reject);
    });

    try { 
      const id = await saveToFirebase();
      ConfigKey.create({ ...payload, position, id })
          .then((configKey) => done(null, configKey))
          .catch(done);
    } catch (e) { done(e); }
  })();
};
