import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const { id } = req.query;

    const done = (err, script) => {
      res.locals.setResponse(err, { script });
      next();
    };

    let script = null;
    try {
      script = await new Promise((resolve) => {
        firebase.database()
          .ref(`scripts/${id}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return done(e); }

    done(null, script);
  })();
};
