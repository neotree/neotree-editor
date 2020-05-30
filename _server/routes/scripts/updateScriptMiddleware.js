import { Script } from '../../models';

module.exports = (app) => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, script) => {
    if (!err) app.io.emit('update_scripts', { scripts: [{ id }] });
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required script "id" is not provided.' });

  Script.update(payload, { where: { id }, individualHooks: true })
    .then(script => done(null, script))
    .catch(done);
};
