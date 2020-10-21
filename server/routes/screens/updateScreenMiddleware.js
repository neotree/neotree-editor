import firebase from '../../firebase';

export const updateScreen = ({ screenId: id, scriptId, ...payload }) => new Promise((resolve, reject) => {
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
    } catch (e) { return reject(e); }

    if (!screen) return reject(new Error(`Screen with id "${id}" not found`));

    screen = { ...screen, ...payload, id, };

    try { await firebase.database().ref(`screens/${scriptId}/${id}`).set(screen); } catch (e) { return reject(e); }

    resolve(screen);
  })();
});

export default (app) => (req, res, next) => {
  (async () => {
    const done = (err, screen) => {
      if (screen) app.io.emit('update_screens', { key: app.getRandomString(), screens: [{ screenId: screen.screenId }] });
      res.locals.setResponse(err, { screen });
      next();
    };

    let screen = null;
    try { screen = await updateScreen(req.body); } catch (e) { return done(e); }

    done(null, screen);
  })();
};
