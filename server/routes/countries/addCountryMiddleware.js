import { Country } from '../../database';
import firebase from '../../database/firebase';

module.exports = app => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, country) => {
      if (country) app.io.emit('add_country', { key: app.getRandomString(), countries: [{ id: country.id }] });
      res.locals.setResponse(err, { country });
      next();
      return null;
    };

    const saveToFirebase = () => new Promise((resolve, reject) => {
      firebase.database().ref('countries').push().then(snap => {
        const countryId = snap.key;

        firebase.database()
          .ref(`countries/${countryId}`).set({
            ...payload,
            countryId,
            createdAt: firebase.database.ServerValue.TIMESTAMP
          }).then(() => {
            resolve(countryId);
          })
          .catch(reject);
      })
      .catch(reject);
    });

    try { 
      const firebase_id = await saveToFirebase();
      Country.create({ ...payload, firebase_id })
          .then((c) => done(null, c))
          .catch(done);
    } catch (e) { done(e); }
  })();
};
