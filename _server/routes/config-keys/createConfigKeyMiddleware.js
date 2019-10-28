import { ConfigKey } from '../../models';
import firebase, { sanitizeDataForFirebase } from '../../firebase';

module.exports = () => (req, res, next) => {
  const payload = req.body;

  const done = (err, configKey) => {
    res.locals.setResponse(err, { configKey });
    next(); return null;
  };

  const saveToFirebase = () => new Promise((resolve, reject) => {
    firebase.database().ref('configkeys').push().then(snap => {
      const { data, ...rest } = payload;

      const configKeyId = snap.key;

      resolve(configKeyId);

      const _data = data ? JSON.parse(data) : null;
      firebase.database()
        .ref('configkeys').child(configKeyId).set(sanitizeDataForFirebase({
          ...rest,
          ..._data,
          configKeyId
        }));
    })
    .catch(reject);
  });

  saveToFirebase()
    .then(id => {
      ConfigKey.create({ ...payload, id })
        .then((configKey) => done(null, configKey))
        .catch(done);
    }).catch(done);
};
