import firebase from '../../firebase';
import { Script, Screen, Diagnosis, Log } from '../../database/models';

export const deleteScript = ({ scriptId: id }, deleteAssociatedData) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required script "id" is not provided.'));

    let script = null;
    try {
      script = await new Promise((resolve) => {
        firebase.database()
          .ref(`scripts/${id}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { /* Do nothing */ }

    try { await firebase.database().ref(`scripts/${id}`).remove(); } catch (e) { return reject(e); }

    if (deleteAssociatedData === false) return resolve(script);

    try { await firebase.database().ref(`screens/${id}`).remove(); } catch (e) { /* do nothing */ }

    try { await firebase.database().ref(`diagnosis/${id}`).remove(); } catch (e) { /* do nothing */ }

    try { await Script.destroy({ where: { script_id: id }, }); } catch (e) { /* Do nothing */ }

    try { await Screen.destroy({ where: { script_id: id }, }); } catch (e) { /* Do nothing */ }

    try { await Diagnosis.destroy({ where: { script_id: id }, }); } catch (e) { /* Do nothing */ }

    resolve(script);
  })();
});

module.exports = (app) => (req, res, next) => {
  (async () => {
    const { scripts, deleteAssociatedData, } = req.body;

    const done = (err, rslts = []) => {
      if (rslts.length) {
        app.io.emit('delete_scripts', { key: app.getRandomString(), scripts });
        Log.create({
          name: 'delete_scripts',
          data: JSON.stringify({ scripts })
        });
      }
      res.locals.setResponse(err, { scripts: rslts });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(scripts.map(s => deleteScript(s, deleteAssociatedData)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
