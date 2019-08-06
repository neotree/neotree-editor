import { Screen } from '../../models';
import { findAndUpdateScreens } from './updateScreensMiddleware';

module.exports = app => (req, res, next) => {
  const payload = req.body;

  const done = (err, screen) => {
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  Screen.create({ ...payload, position: 1 })
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
};
