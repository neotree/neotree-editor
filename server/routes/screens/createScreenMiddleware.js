import firebase from '../../firebase';
import { Log, Screen } from '../../database/models';

module.exports = app => (req, res, next) => {
  (async () => {
    const { scriptId, ...payload } = req.body;

    const done = (err, screen) => {
      if (screen) {
        app.io.emit('create_screens', { key: app.getRandomString(), screens: [{ id: screen.id, scriptId }] });
        Log.create({
          name: 'create_screens',
          data: JSON.stringify({ screens: [{ id: screen.id, scriptId }] })
        });
      }
      res.locals.setResponse(err, { screen });
      next();
    };

    if (!scriptId) return done(new Error('Required script "id" is not provided.'));

    let screenId = null;
    try {
      const snap = await firebase.database().ref(`screens/${scriptId}`).push();
      screenId = snap.key;
    } catch (e) { return done(e); }

    let screens = {};
    try {
      screens = await new Promise((resolve) => {
        firebase.database()
          .ref(`screens/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      screens = screens || {};
    } catch (e) { /* Do nothing */ }

    const screen = {
      ...payload,
      scriptId,
      screenId,
      id: screenId,
      position: Object.keys(screens).length + 1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    try { await firebase.database().ref(`screens/${scriptId}/${screenId}`).set(screen); } catch (e) { return done(e); }

    try {
      await Screen.findOrCreate({
        where: { screen_id: screen.screenId },
        defaults: {
          screen_id: screen.screenId,
          script_id: screen.scriptId,
          type: screen.type,
          position: screen.position,
          data: JSON.stringify(screen),
        }
      });
    } catch (e) { /* Do nothing */ }

    done(null, screen);
  })();
};
