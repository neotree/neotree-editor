import { UserCountry } from '../../database';
import firebase from '../../database/firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, uc) => {
      if (uc) app.io.emit('add_user_countries', { key: app.getRandomString(), user_countries: [{ id: uc.id }] });
      res.locals.setResponse(err, { userCountry: uc });
      next();
      return null;
    };

    let firebase_id = null;
    try {
      const snap = firebase.database().ref('user_countries').push();
      firebase_id = snap.key;
    } catch (e) { return done(e); }

    let userCountry = null;
    try {
      const rslts = await UserCountry.create({ ...payload, firebase_id });
      userCountry = JSON.parse(JSON.stringify(rslts));
    } catch (e) { return done(e); }

    try {
      const { id, ...c } = userCountry; // eslint-disable-line
      await firebase.database().ref(`user_countries/${firebase_id}`).set(c);
      done(null, userCountry);
    } catch (e) { return done(e); }
  })();
};
