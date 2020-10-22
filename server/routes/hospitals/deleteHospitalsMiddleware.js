import firebase from '../../firebase';

export const deleteHospital = ({ hospitalId: id }, deleteAssociatedData) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required hospital "id" is not provided.'));

    let hospital = null;
    try {
      hospital = await new Promise((resolve) => {
        firebase.database()
          .ref(`hospitals/${id}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { /* Do nothing */ }

    try { await firebase.database().ref(`hospitals/${id}`).remove(); } catch (e) { return reject(e); }

    if (deleteAssociatedData === false) return resolve(hospital);

    try { await firebase.database().ref(`screens/${id}`).remove(); } catch (e) { /* do nothing */ }

    try { await firebase.database().ref(`diagnosis/${id}`).remove(); } catch (e) { /* do nothing */ }

    resolve(hospital);
  })();
});

module.exports = (app) => (req, res, next) => {
  (async () => {
    const { hospitals, deleteAssociatedData, } = req.body;

    const done = (err, rslts = []) => {
      if (rslts.length) app.io.emit('delete_config_keys', { key: app.getRandomString(), hospitals });
      res.locals.setResponse(err, { hospitals: rslts });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(hospitals.map(s => deleteHospital(s, deleteAssociatedData)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
