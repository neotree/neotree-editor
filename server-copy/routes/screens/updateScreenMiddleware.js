import { Screen } from '../../database';

module.exports = (app) => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, screen) => {
    if (screen) app.io.emit('update_screens', { key: app.getRandomString(), screens: [{ id }] });
    res.locals.setResponse(err, { screen });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required screen "id" is not provided.' });

  Screen.update(payload, { where: { id }, individualHooks: true })
    .then(rslts => done(null, rslts && rslts[1] ? rslts[1][0] : null))
    .catch(done);
};
