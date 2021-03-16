import { Hospital, } from '../../database';
import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, hospital) => {
      res.locals.setResponse(err, { hospital });
      next();
    };

    try {
      const snap = await firebase.database().ref('configKeys').push();
      const hospital_id = snap.key;

      const hospital = await Hospital.create({ ...payload, hospital_id });
      done(null, hospital);
    } catch (e) { return done(e); }
  })();
};
