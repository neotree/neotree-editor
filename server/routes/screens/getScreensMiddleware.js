import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId } = req.query;

    const done = (err, screens) => {
      res.locals.setResponse(err, { screens });
      next();
    };

    if (!scriptId) return done(new Error('Required script "id" is not provided.'));

    let screens = {};
    try {
      screens = await new Promise((resolve) => {
        firebase.database()
          .ref(`screens/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      screens = screens || {};
    } catch (e) { return done(e); }

    done(
      null,
      Object.keys(screens).map(key => screens[key]).sort((a, b) => a.position - b.position)
    );
  })();
};
