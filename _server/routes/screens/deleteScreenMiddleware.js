import { Screen } from '../../models';
import { findAndUpdateScreens } from './updateScreensMiddleware';

module.exports = app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, screen) => {
    if (!err) app.io.emit('delete_screens', { screens: [{ id }] });
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required screen "id" is not provided.' });

  Screen.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find script with "id" ${id}.` });

      s.destroy({ where: { id } })
        .then(deleted => {
          // update screens positions
          findAndUpdateScreens(
            {
              attributes: ['id'],
              where: { script_id: s.script_id },
              order: [['position', 'ASC']]
            },
            screens => screens.map((scr, i) => ({ ...scr, position: i + 1 }))
          ).then(() => null).catch(err => { app.logger.log(err); return null; });

          return done(null, { deleted });
        })
        .catch(done);

      return null;
    })
    .catch(done);
};
