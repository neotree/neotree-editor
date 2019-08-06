import uuid from 'uuidv4';
import { Screen } from '../../models';
import { findAndUpdateScreens } from './updateScreensMiddleware';

export const copyScreen = (req, screen) => {
  const author = (req.user || {}).id || null;

  return new Promise((resolve, reject) => {
    Screen.create({
      ...screen,
      id: uuid(),
      author,
      data: JSON.stringify(screen.data),
      details: JSON.stringify({
        original_config_key_id: screen.id,
        original_host: `${req.protocol}://${req.headers.host}`
      })
    })
      .then(screen => resolve(screen))
      .catch(err => reject(err));
  });
};

export default app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, screen) => {
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

      copyScreen(req, screen)
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
