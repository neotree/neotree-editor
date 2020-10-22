import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId } = req.query;

    const done = (err, diagnoses) => {
      res.locals.setResponse(err, { diagnoses });
      next();
    };

    if (!scriptId) return done(new Error('Required script "id" is not provided.'));

    let diagnoses = {};
    try {
      diagnoses = await new Promise((resolve) => {
        firebase.database()
          .ref(`diagnosis/${scriptId}`)
          .on('value', snap => resolve(snap.val()));
      });
      diagnoses = diagnoses || {};
    } catch (e) { return done(e); }

    done(
      null,
      Object.keys(diagnoses).map(key => diagnoses[key]).sort((a, b) => a.position - b.position)
    );
  })();
};
