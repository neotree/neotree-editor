import { Hospital } from '../../database';
import firebase from '../../database/firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, hospital) => {
      if (hospital) app.io.emit('add_hospital', { key: app.getRandomString(), hospitals: [{ id: hospital.id }] });
      res.locals.setResponse(err, { hospital });
      next();
      return null;
    };

    const saveToFirebase = () => new Promise((resolve, reject) => {
      firebase.database().ref('hospitals').push().then(snap => {
        const hospitalId = snap.key;

        firebase.database()
          .ref(`hospitals/${hospitalId}`).set({
            ...payload,
            hospitalId,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          }).then(() => {
            resolve(hospitalId);
          })
          .catch(reject);
      })
      .catch(reject);
    });

    try { 
      const firebase_id = await saveToFirebase();
      Hospital.create({ ...payload, firebase_id })
          .then((c) => done(null, c))
          .catch(done);
    } catch (e) { done(e); }
  })();
};
