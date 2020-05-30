import firebase from '../../firebase';
import { Screen } from '../../models';
import { findAndUpdateScreens } from './updateScreensMiddleware';

export const copyScreen = (screen) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref(`screens/${screen.script_id}`).push().then(snap => {
      const { data, ...rest } = screen;

      const screenId = snap.key;

      firebase.database()
        .ref(`screens/${screen.script_id}/${screenId}`).set({
          ...rest,
          ...data,
          screenId,
          scriptId: screen.script_id,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          Screen.create({
            ...screen,
            screen_id: screenId,
            data: JSON.stringify(screen.data),
          })
            .then(screen => resolve(screen))
            .catch(err => reject(err));
        })
        .catch(reject);
    })
    .catch(reject);
  });
};

export default app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, screen) => {
    if (screen) app.io.emit('create_screens', { screens: [{ id: screen.id }] });
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required screen "id" is not provided.' });

  Promise.all([
    Screen.findOne({ where: { id } }),
  ])
    .then(([screen]) => {
      if (!screen) return done({ msg: `Could not find screen with "id" ${id}.` });

      screen = screen.toJSON();

      copyScreen(screen)
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

      return null;
    })
    .catch(done);
};
