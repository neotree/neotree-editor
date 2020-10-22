import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const done = (err, configKeys) => {
      res.locals.setResponse(err, { configKeys });
      next();
    };

    let configKeys = {};
    try {
      configKeys = await new Promise((resolve) => {
        firebase.database()
          .ref('configkeys')
          .on('value', snap => resolve(snap.val()));
      });
      configKeys = configKeys || {};
    } catch (e) { return done(e); }

    done(
      null,
      Object.keys(configKeys).map(key => configKeys[key]).sort((a, b) => a.position - b.position)
    );
  })();
};
