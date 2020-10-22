import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const { configKeyId } = req.query;

    const done = (err, configKey) => {
      res.locals.setResponse(err, { configKey });
      next();
    };

    let configKey = null;
    try {
      configKey = await new Promise((resolve) => {
        firebase.database()
          .ref(`configkeys/${configKeyId}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return done(e); }

    done(null, configKey);
  })();
};
