import firebase from '../../database/firebase';
import { Script } from '../../database';

module.exports = (app, params) => (req, res, next) => {
  (async () => {
    const payload = params || req.body;

    const done = (err, script) => {
      if (script) app.io.emit('create_scripts', { key: app.getRandomString(), scripts: [{ id: script.id }] });
      res.locals.setResponse(err, { script });
      next(); return null;
    };

    let position = 0;
    try { 
      position = await Script.count({ where: {} }); 
      position++;
    } catch (e) { return done(e); }

    const saveToFirebase = () => new Promise((resolve, reject) => {
      firebase.database().ref('scripts').push().then(snap => {
        const { data, ...rest } = payload;

        const scriptId = snap.key;

        const _data = data ? JSON.parse(data) : null;

        firebase.database()
          .ref(`scripts/${scriptId}`).set({
            ...rest,
            ..._data,
            position,
            scriptId,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          }).then(() => {
            resolve(scriptId);
          })
          .catch(reject);
      })
      .catch(reject);
    });

    try { 
      const script_id = await saveToFirebase();
      Script.create({ ...payload, position, script_id })
          .then((script) => done(null, script))
          .catch(done);
    } catch (e) { done(e); }
  })();
};
