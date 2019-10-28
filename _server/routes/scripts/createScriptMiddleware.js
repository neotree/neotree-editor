import firebase, { sanitizeDataForFirebase } from '../../firebase';
import { Script } from '../../models';

module.exports = (app, params) => (req, res, next) => {
  const payload = params || req.body;

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  const saveToFirebase = () => new Promise((resolve, reject) => {
    firebase.database().ref('scripts').push().then(snap => {
      const { data, ...rest } = payload;

      const scriptId = snap.key;

      resolve(scriptId);

      const _data = data ? JSON.parse(data) : null;
      firebase.database()
        .ref('scripts').child(scriptId).update(sanitizeDataForFirebase({
          ...rest,
          ..._data,
          scriptId
        }));
    })
    .catch(reject);
  });

  saveToFirebase()
    .then(id => {
      Script.create({ ...payload, id })
        .then((script) => done(null, script))
        .catch(done);
    }).catch(done);
};
