import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId } = req.query;

    const done = (err, screens, diagnoses) => {
      res.locals.setResponse(err, { screens, diagnoses });
      next();
    };

    let screens = {};
    try {
      screens = await new Promise((resolve) => {
        firebase.database()
          .ref(`screens/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      screens = screens || {};
    } catch (e) { /* Do nothing */ }

    let diagnosis = {};
    try {
      diagnosis = await new Promise((resolve) => {
        firebase.database()
          .ref(`diagnosis/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      diagnosis = diagnosis || {};
    } catch (e) { /* Do nothing */ }

    done(
      null,
      Object.keys(screens).map(key => screens[key]).sort((a, b) => a.position - b.position),
      Object.keys(diagnosis).map(key => diagnosis[key]).sort((a, b) => a.position - b.position)
    );
  })();
};
