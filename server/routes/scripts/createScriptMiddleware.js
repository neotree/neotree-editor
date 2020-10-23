import firebase from '../../firebase';
import { Script, Log, } from '../../database';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, script) => {
      if (script) {
        app.io.emit('create_scripts', { key: app.getRandomString(), scripts: [{ scriptId: script.scriptId }] });
        Log.create({
          name: 'create_scripts',
          data: JSON.stringify({ scripts: [{ scriptId: script.scriptId }] })
        });
      }
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

    try {
      await Script.findOrCreate({
        where: { script_id: script.scriptId },
        defaults: {
          position: script.position,
          data: JSON.stringify(script),
        }
      });
    } catch (e) { /* Do nothing */ }

    done(null, script);
  })();
};
