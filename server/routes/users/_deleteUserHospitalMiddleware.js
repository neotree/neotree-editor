import { UserHospital, Log } from '../../database';

module.exports = app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, userHospital) => {
    if (!err) {
      app.io.emit('delete_user_hospitals', { key: app.getRandomString(), userHospitals: [{ id }] });
      Log.create({
        name: 'delete_user_hospitals',
        data: JSON.stringify({ userHospitals: [{ id }] })
      });
    }
    res.locals.setResponse(err, { userHospital });
    next();
    return null;
  };

  if (!id) return done({ msg: 'Required userHospital "id" is not provided.' });

  UserHospital.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find userHospital with "id" ${id}.` });

      s.destroy({ where: { id } })
        .then(deleted => done(null, { deleted }))
        .catch(done);

      return null;
    })
    .catch(done);
};
