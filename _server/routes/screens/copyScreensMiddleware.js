import { Screen } from '../../models';
import { findAndUpdateScreens } from './updateScreensMiddleware';
import firebase from '../../firebase';

module.exports = app => (req, res, next) => {
  const payload = req.body;

  const done = (err, items) => {
    if (err) app.logger.log(err);
    res.locals.setResponse(err, { items });
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

  Screen.findAll({ where: { id: payload.ids } })
    .then(screens => {
      Promise.all(screens.map(screen => {
        screen = JSON.parse(JSON.stringify(screen));
        const { createdAt, updateAt, id, ...scr } = screen; // eslint-disable-line
        return saveToFirebase({ ...scr, script_id: payload.script_id });
      }))
      .then(items => Promise.all(items.map((item, i) => Screen.create({
        ...item,
        position: i + 1
      })))
        .then(items => {
          Promise.all(items.map(item => {
            // update screens positions
            return findAndUpdateScreens(
              {
                attributes: ['id'],
                where: { script_id: item.script_id },
                order: [['position', 'ASC']]
              },
              screens => screens.map((scr, i) => ({ ...scr, position: i + 1 }))
            );
          }))
          .then(() => done(null, items))
          .catch(() => done(null, items));
        }))
        .catch(done);
    })
    .catch(done);
};
