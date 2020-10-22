import firebase from '../../firebase';

export const deleteConfigKey = ({ configKeyId: id }, deleteAssociatedData) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required configKey "id" is not provided.'));

    let configKey = null;
    try {
      configKey = await new Promise((resolve) => {
        firebase.database()
          .ref(`configkeys/${id}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { /* Do nothing */ }

    try { await firebase.database().ref(`configkeys/${id}`).remove(); } catch (e) { return reject(e); }

    if (deleteAssociatedData === false) return resolve(configKey);

    try { await firebase.database().ref(`screens/${id}`).remove(); } catch (e) { /* do nothing */ }

    try { await firebase.database().ref(`diagnosis/${id}`).remove(); } catch (e) { /* do nothing */ }

    resolve(configKey);
  })();
});

module.exports = (app) => (req, res, next) => {
  (async () => {
    const { configKeys, deleteAssociatedData, } = req.body;

    const done = (err, rslts = []) => {
      if (rslts.length) app.io.emit('delete_config_keys', { key: app.getRandomString(), configKeys });
      res.locals.setResponse(err, { configKeys: rslts });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(configKeys.map(s => deleteConfigKey(s, deleteAssociatedData)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
