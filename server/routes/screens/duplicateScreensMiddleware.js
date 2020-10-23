import firebase from '../../firebase';
import { Log, Screen } from '../../database/models';

export const copyScreen = ({ scriptId, screenId: id, }) => {
  return new Promise((resolve, reject) => {
    (async () => {
      if (!scriptId) return reject(new Error('Required script "id" is not provided.'));

      if (!id) return reject(new Error('Required screen "id" is not provided.'));

      let screenId = null;
      try {
        const snap = await firebase.database().ref('screens').push();
        screenId = snap.key;
      } catch (e) { return reject(e); }

      let screen = null;
      try {
        screen = await new Promise((resolve) => {
          firebase.database()
            .ref(`screens/${scriptId}/${id}`)
            .on('value', snap => resolve(snap.val()));
        });
      } catch (e) { /* Do nothing */ }

      if (!screen) return reject(new Error(`Screen with id "${id}" not found`));

      let screens = {};
      try {
        screens = await new Promise((resolve) => {
          firebase.database()
            .ref(`screens/${scriptId}`)
            .on('value', snap => resolve(snap.val()));
        });
        screens = screens || {};
      } catch (e) { /* Do nothing */ }

      screen = {
        ...screen,
        screenId,
        id: screenId,
        position: Object.keys(screens).length + 1,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
      };

      try { await firebase.database().ref(`screens/${scriptId}/${screenId}`).set(screen); } catch (e) { return reject(e); }

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

      resolve(screen);
    })();
  });
};

export default (app) => (req, res, next) => {
  (async () => {
    const { screens } = req.body;

    const done = (err, _screens = []) => {
      if (_screens.length) {
        app.io.emit('create_screens', { key: app.getRandomString(), screens });
        Log.create({
          name: 'create_screens',
          data: JSON.stringify({ screens })
        });
      }
      res.locals.setResponse(err, { screens: _screens });
      next();
    };

    let _screens = [];
    try {
      _screens = await Promise.all(screens.map(s => copyScreen(s)));
    } catch (e) { return done(e); }

    done(null, _screens);
  })();
};
