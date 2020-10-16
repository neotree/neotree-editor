import { UserHospital } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, userHospitals) => {
    res.locals.setResponse(err, { userHospitals });
    next();
    return null;
  };

  UserHospital.findAll({ where: payload, })
    .then(userHospitals => done(null, userHospitals))
    .catch(done);
};
