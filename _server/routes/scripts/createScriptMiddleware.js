import firebase from '../../firebase';
import { Log, Script } from '../../models';

module.exports = (app, params) => (req, res, next) => {
  const payload = params || req.body;

  const done = (err, script) => {
    if (script) {
      app.io.emit('create_scripts', { scripts: [{ scriptId: script.id }] });
      Log.create({
        name: 'create_scripts',
        data: JSON.stringify({ scripts: [{ scriptId: script.id }] })
      });
    }
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

  saveToFirebase()
    .then(id => {
      Script.create({ ...payload, id })
        .then((script) => done(null, script))
        .catch(done);
    }).catch(done);
};
