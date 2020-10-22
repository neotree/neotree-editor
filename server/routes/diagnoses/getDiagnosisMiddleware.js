import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId, diagnosisId } = req.query;

    const done = (err, diagnosis) => {
      res.locals.setResponse(err, { diagnosis });
      next();
    };

    if (!scriptId) return done(new Error('Required script "id" is not provided.'));

    if (!diagnosisId) return done(new Error('Required diagnosis "id" is not provided.'));

    let diagnosis = null;
    try {
      diagnosis = await new Promise((resolve) => {
        firebase.database()
          .ref(`diagnosis/${scriptId}/${diagnosisId}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return done(e); }

    done(null, diagnosis);
  })();
};
