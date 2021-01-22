import firebase from '../../firebase';
import { Script, } from '../../database';

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

    let scriptsCount = 0;
    try {
      scriptsCount = await Script.count({ where: {} });
    } catch (e) { /* Do nothing */ }

    let script = {
      ...payload,
      scriptId,
      position: scriptsCount + 1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    try {
      const rslts = await Script.findOrCreate({
        where: { script_id: script.scriptId },
        defaults: {
          position: script.position,
          data: JSON.stringify(script),
        }
      });
      if (rslts && rslts[0]) {
        const { data, ...s } = JSON.parse(JSON.stringify(rslts[0]));
        script = { ...data, ...s };
      }
    } catch (e) { return done(e); }

    done(null, script);
  })();
};
