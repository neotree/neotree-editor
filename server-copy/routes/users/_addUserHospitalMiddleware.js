import { UserHospital } from '../../database';
import firebase from '../../database/firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, uh) => {
      if (uh) app.io.emit('add_user_hospitals', { key: app.getRandomString(), user_hospitals: [{ id: uh.id }] });
      res.locals.setResponse(err, { userHospital: uh });
      next();
      return null;
    };

    let firebase_id = null;
    try {
      const snap = firebase.database().ref('user_hospitals').push();
      firebase_id = snap.key;
    } catch (e) { return done(e); }

    let userHospital = null;
    try {
      const rslts = await UserHospital.create({ ...payload, firebase_id });
      userHospital = JSON.parse(JSON.stringify(rslts));
    } catch (e) { return done(e); }

    try {
      const { id, ...h } = userHospital; // eslint-disable-line
      await firebase.database().ref(`user_hospitals/${firebase_id}`).set(h);
      done(null, userHospital);
    } catch (e) { return done(e); }
  })();
};
