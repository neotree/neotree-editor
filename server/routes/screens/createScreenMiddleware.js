import firebase from '../../firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const { scriptId, ...payload } = req.body;

    const done = (err, screen) => {
      if (screen) app.io.emit('create_screens', { key: app.getRandomString(), screens: [{ id: screen.id, scriptId }] });
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

    const screen = { ...payload, scriptId, screenId, id: screenId, position: Object.keys(screens).length + 1, };

    try { await firebase.database().ref(`screens/${scriptId}`).set(screen); } catch (e) { return done(e); }

    done(null, screen);
  })();
};
