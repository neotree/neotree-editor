import { Script } from '../../database';

module.exports = (app) => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, script) => {
    if (!err) app.io.emit('update_scripts', { key: app.getRandomString(), scripts: [{ id }] });
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required script "id" is not provided.' });

  Script.update(payload, { where: { id }, individualHooks: true })
    .then(rslts => done(null, rslts && rslts[1] ? rslts[1][0] : null))
    .catch(done);
};
