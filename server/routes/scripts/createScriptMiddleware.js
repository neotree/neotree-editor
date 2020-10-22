import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, script) => {
      res.locals.setResponse(err, { script });
      next();
    };

    let scriptId = null;
    try {
      const snap = await firebase.database().ref('scripts').push();
      scriptId = snap.key;
    } catch (e) { return done(e); }

    let scripts = {};
    try {
      scripts = await new Promise((resolve) => {
        firebase.database()
          .ref('scripts')
          .on('value', snap => resolve(snap.val()));
      });
      scripts = scripts || {};
    } catch (e) { /* Do nothing */ }

    const script = {
      ...payload,
      scriptId,
      id: scriptId,
      position: Object.keys(scripts).length + 1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    try { await firebase.database().ref(`scripts/${scriptId}`).set(script); } catch (e) { return done(e); }

    done(null, script);
  })();
};
