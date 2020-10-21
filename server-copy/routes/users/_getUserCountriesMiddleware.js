import { UserCountry } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, userCountries) => {
    res.locals.setResponse(err, { userCountries });
    next();
    return null;
  };

  UserCountry.findAll({ where: payload, })
    .then(userCountries => done(null, userCountries))
    .catch(done);
};
