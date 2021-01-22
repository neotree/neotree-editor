import { Screen } from '../../database/models';

export const updateScreen = ({ id, ...payload }) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required screen "id" is not provided.'));

    let screen = null;
    try {
      screen = await Screen.findOne({ where: { id } });
    } catch (e) { return reject(e); }

    if (!screen) return reject(new Error(`Screen with id "${id}" not found`));

    try {
      await Screen.update(
        {
          position: payload.position || screen.position,
          data: JSON.stringify({ ...screen.data, ...payload }),
        },
        { where: { id } }
      );
    } catch (e) { /* Do nothing */ }

    resolve(screen);
  })();
});

export default () => (req, res, next) => {
  (async () => {
    const done = (err, screen) => {
      res.locals.setResponse(err, { screen });
      next();
    };

    let screen = null;
    try { screen = await updateScreen(req.body); } catch (e) { return done(e); }

    done(null, screen);
  })();
};
