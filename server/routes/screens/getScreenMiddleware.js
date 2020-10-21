import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId, screenId } = req.query;

    const done = (err, screen) => {
      res.locals.setResponse(err, { screen });
      next();
    };

    if (!scriptId) return done(new Error('Required script "id" is not provided.'));

    if (!screenId) return done(new Error('Required screen "id" is not provided.'));

    let screen = null;
    try {
      screen = await new Promise((resolve) => {
        firebase.database()
          .ref(`screens/${scriptId}/${screenId}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return done(e); }

    done(null, screen);
  })();
};
