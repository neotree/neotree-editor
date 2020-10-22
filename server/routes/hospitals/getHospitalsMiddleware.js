import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const done = (err, hospitals) => {
      res.locals.setResponse(err, { hospitals });
      next();
    };

    let hospitals = {};
    try {
      hospitals = await new Promise((resolve) => {
        firebase.database()
          .ref('hospitals')
          .on('value', snap => resolve(snap.val()));
      });
      hospitals = hospitals || {};
    } catch (e) { return done(e); }

    done(
      null,
      Object.keys(hospitals).map(key => hospitals[key]).sort((a, b) => a.position - b.position)
    );
  })();
};
