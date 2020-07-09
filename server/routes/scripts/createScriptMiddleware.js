import firebase from '../../firebase';
import { Script } from '../../models';

module.exports = (app, params) => (req, res, next) => {
  const payload = params || req.body;

  const done = (err, script) => {
    if (script) app.io.emit('create_scripts', { scripts: [{ id: script.id }] });
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  const saveToFirebase = () => new Promise((resolve, reject) => {
    firebase.database().ref('scripts').push().then(snap => {
      const { data, ...rest } = payload;

      const scriptId = snap.key;

      const _data = data ? JSON.parse(data) : null;

      firebase.database()
        .ref(`scripts/${scriptId}`).set({
          ...rest,
          ..._data,
          scriptId,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          resolve(scriptId);
        })
        .catch(reject);
    })
    .catch(reject);
  });

  Promise.all([
    Script.count({ where: {} }),
    saveToFirebase(),
  ])
    .then(([count, id]) => {
      Script.create({ ...payload, position: count + 1, id })
        .then((script) => done(null, script))
        .catch(done);
    }).catch(done);
};
