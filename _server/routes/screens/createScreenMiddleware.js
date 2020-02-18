import { Screen } from '../../models';
import firebase from '../../firebase';

module.exports = app => (req, res, next) => {
  const payload = req.body;

  const done = (err, screen) => {
    if (err) app.logger.log(err);
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  const saveToFirebase = () => new Promise((resolve, reject) => {
    firebase.database().ref(`screens/${payload.script_id}`).push().then(snap => {
      const { data, ...rest } = payload;

      const screenId = snap.key;

      const _data = data ? JSON.parse(data) : null;

      firebase.database()
        .ref(`screens/${payload.script_id}/${screenId}`).set({
          ...rest,
          ..._data,
          screenId,
          scriptId: payload.script_id,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          resolve(screenId);
        })
        .catch(reject);
    })
    .catch(reject);
  });

  Promise.all([
    Screen.count({ where: { script_id: payload.script_id } }),
    saveToFirebase()
  ])
    .then(([count, screen_id]) => {
      Screen.create({ ...payload, position: count + 1, screen_id })
        .then((screen) => done(null, screen))
        .catch(done);
    }).catch(done);
};
