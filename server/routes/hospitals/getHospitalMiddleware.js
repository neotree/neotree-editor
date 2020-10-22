import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const { hospitalId } = req.query;

    const done = (err, hospital) => {
      res.locals.setResponse(err, { hospital });
      next();
    };

    let hospital = null;
    try {
      hospital = await new Promise((resolve) => {
        firebase.database()
          .ref(`hospitals/${hospitalId}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return done(e); }

    done(null, hospital);
  })();
};
