import firebase from '../../firebase';

export const updateHospital = ({ hospitalId: id, ...payload }) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required hospital "id" is not provided.'));

    let hospital = null;
    try {
      hospital = await new Promise((resolve) => {
        firebase.database()
          .ref(`hospitals/${id}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { return reject(e); }

    if (!hospital) return reject(new Error(`Hospital with id "${id}" not found`));

    hospital = { ...hospital, ...payload, id, updatedAt: firebase.database.ServerValue.TIMESTAMP, };

    try { await firebase.database().ref(`hospitals/${id}`).set(hospital); } catch (e) { return reject(e); }

    resolve(hospital);
  })();
});

export default (app) => (req, res, next) => {
  (async () => {
    const done = (err, hospital) => {
      if (hospital) app.io.emit('update_config_keys', { key: app.getRandomString(), hospitals: [{ hospitalId: hospital.hospitalId }] });
      res.locals.setResponse(err, { hospital });
      next();
    };

    let hospital = null;
    try { hospital = await updateHospital(req.body); } catch (e) { return done(e); }

    done(null, hospital);
  })();
};
