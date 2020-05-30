import { Screen } from '../../models';

module.exports = (app) => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, screen) => {
    if (screen) app.io.emit('update_screens', { screens: [{ id }] });
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required screen "id" is not provided.' });

  Screen.update(payload, { where: { id }, individualHooks: true })
    .then(screen => done(null, screen))
    .catch(done);
};
