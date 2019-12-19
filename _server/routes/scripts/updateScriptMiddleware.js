import { Script } from '../../models';

module.exports = () => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required script "id" is not provided.' });

  Script.update(payload, { where: { id }, individualHooks: true })
    .then(script => done(null, script))
    .catch(done);
};
