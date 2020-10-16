import { UserCountry } from '../../database';

module.exports = (app) => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, userCountry) => {
    if (!err) app.io.emit('update_user_countries', { key: app.getRandomString(), users: [{ id }] });
    res.locals.setResponse(err, { userCountry });
    next();
    return null;
  };

  if (!id) return done({ msg: 'Required userCountry "id" is not provided.' });

  UserCountry.update(payload, { where: { id }, individualHooks: true })
    .then(rslts => done(null, rslts && rslts[1] ? rslts[1][0] : null))
    .catch(done);
};
