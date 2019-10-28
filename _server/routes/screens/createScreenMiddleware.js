import { Screen } from '../../models';
import { findAndUpdateScreens } from './updateScreensMiddleware';
import firebase, { sanitizeDataForFirebase } from '../../firebase';

module.exports = app => (req, res, next) => {
  const payload = req.body;

  const done = (err, screen) => {
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  const saveToFirebase = () => new Promise((resolve, reject) => {
    firebase.database().ref(`screens/${payload.script_id}`).push().then(snap => {
      const { data, ...rest } = payload;

      const screenId = snap.key;

      resolve(screenId);

      const _data = data ? JSON.parse(data) : null;
      firebase.database()
        .ref(`screens/${payload.script_id}`).child(screenId).update(sanitizeDataForFirebase({
          ...rest,
          ..._data,
          screenId,
          scriptId: payload.script_id
        }));
    })
    .catch(reject);
  });

  saveToFirebase()
    .then(id => {
      Screen.create({ ...payload, position: 1, id })
        .then((screen) => {
          // update screens positions
          findAndUpdateScreens(
            {
              attributes: ['id'],
              where: { script_id: screen.script_id },
              order: [['position', 'ASC']]
            },
            screens => screens.map((scr, i) => ({ ...scr, position: i + 1 }))
          ).then(() => null).catch(err => { app.logger.log(err); return null; });

          return done(null, screen);
        })
        .catch(done);
    }).catch(done);
};
