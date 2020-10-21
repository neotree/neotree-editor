import { User } from '../../database';

module.exports = (app) => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, user) => {
    if (!err) app.io.emit('update_users', { key: app.getRandomString(), users: [{ id }] });
    res.locals.setResponse(err, { user });
    next();
    return null;
  };

  if (!id) return done({ msg: 'Required user "id" is not provided.' });

  User.update(payload, { where: { id }, individualHooks: true })
    .then(rslts => done(null, rslts && rslts[1] ? rslts[1][0] : null))
    .catch(done);
};
