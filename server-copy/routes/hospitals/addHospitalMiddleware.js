import firebase from '../../database/firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, hospital) => {
      if (hospital) app.io.emit('add_hospitals', { key: app.getRandomString(), hospitals: [{ id: hospital.id }] });
      res.locals.setResponse(err, { hospital });
      next();
      return null;
    };

    let hospital_id = null;
    try {
      const snap = firebase.database().ref('hospitals').push();
      hospital_id = snap.key;
    } catch (e) { return done(e); }

    const hospital = { ...payload, hospital_id };

    try {
      const { id, ...h } = hospital; // eslint-disable-line
      await firebase.database().ref(`hospitals/${hospital_id}`).set(h);
      done(null, hospital);
    } catch (e) { return done(e); }
  })();
};
