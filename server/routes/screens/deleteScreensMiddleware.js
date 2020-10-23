import firebase from '../../firebase';
import { Log, Screen } from '../../database/models';

export const deleteScreen = ({ scriptId, screenId: id, }) => new Promise((resolve, reject) => {
  (async () => {
    if (!scriptId) return reject(new Error('Required script "id" is not provided.'));

    if (!id) return reject(new Error('Required screen "id" is not provided.'));

    let screen = null;
    try {
      screen = await new Promise((resolve) => {
        firebase.database()
          .ref(`screens/${scriptId}/${id}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { /* Do nothing */ }

    try { await firebase.database().ref(`screens/${scriptId}/${id}`).remove(); } catch (e) { return reject(e); }

    try { await Screen.destroy({ where: { screen_id: id }, }); } catch (e) { /* Do nothing */ }

    resolve(screen);
  })();
});

export default (app) => (req, res, next) => {
  (async () => {
    const { screens } = req.body;

    const done = (err, rslts = []) => {
      if (rslts.length) {
        app.io.emit('delete_screens', { key: app.getRandomString(), screens });
        Log.create({
          name: 'delete_screens',
          data: JSON.stringify({ screens })
        });
      }
      res.locals.setResponse(err, { screens: rslts });
      next();
    };

    let rslts = null;
    try { rslts = await Promise.all(screens.map(s => deleteScreen(s))); } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
