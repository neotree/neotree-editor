import firebase from '../../firebase';

module.exports = () => (req, res, next) => {
  (async () => {
    const payload = req.body;

    const done = (err, hospital) => {
      res.locals.setResponse(err, { hospital });
      next();
    };

    let hospitalId = null;
    try {
      const snap = await firebase.database().ref('hospitals').push();
      hospitalId = snap.key;
    } catch (e) { return done(e); }

    let hospitals = {};
    try {
      hospitals = await new Promise((resolve) => {
        firebase.database()
          .ref('hospitals')
          .on('value', snap => resolve(snap.val()));
      });
      hospitals = hospitals || {};
    } catch (e) { /* Do nothing */ }

    const hospital = {
      ...payload,
      hospitalId,
      id: hospitalId,
      position: Object.keys(hospitals).length + 1,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
    };

    try { await firebase.database().ref(`hospitals/${hospitalId}`).set(hospital); } catch (e) { return done(e); }

    done(null, hospital);
  })();
};
