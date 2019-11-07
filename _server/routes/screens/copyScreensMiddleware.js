import { Screen } from '../../models';
import { findAndUpdateScreens } from './updateScreensMiddleware';
import firebase from '../../firebase';

module.exports = app => (req, res, next) => {
  const payload = req.body;

  const done = (err, screen) => {
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  const saveToFirebase = payload => new Promise((resolve, reject) => {
    firebase.database().ref(`screens/${payload.script_id}`).push().then(snap => {
      const { data, ...rest } = payload;

      const screenId = snap.key;

      const screen = {
        ...rest,
        ...data,
        screenId,
        scriptId: payload.script_id,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      };

      firebase.database()
        .ref(`screens/${payload.script_id}/${screenId}`).set(screen).then(() => {
          resolve({
            ...rest,
            id: screenId,
            data: JSON.stringify(screen)
          });
        })
        .catch(reject);
    })
    .catch(reject);
  });

  Screen.findAll({ where: { id: { in: payload.ids } } })
    .then(screens => {
      Promise.all(screens.map(({ createdAt, updateAt, id, ...scr }) => { // eslint-disable-line
        return saveToFirebase(scr);
      }))
      .then(scr => {
        Screen.create({ ...scr, position: 1 })
          .then(screen => {
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
      })
      .catch(done);
    })
    .catch(done);
};
