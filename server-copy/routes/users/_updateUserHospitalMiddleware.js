import { UserHospital } from '../../database';

module.exports = (app) => (req, res, next) => {
  const { id, ...payload } = req.body;

  const done = (err, userHospital) => {
    if (!err) app.io.emit('update_user_hospitals', { key: app.getRandomString(), userHospitals: [{ id }] });
    res.locals.setResponse(err, { userHospital });
    next();
    return null;
  };

  if (!id) return done({ msg: 'Required userHospital "id" is not provided.' });

  UserHospital.update(payload, { where: { id }, individualHooks: true })
    .then(rslts => done(null, rslts && rslts[1] ? rslts[1][0] : null))
    .catch(done);
};
