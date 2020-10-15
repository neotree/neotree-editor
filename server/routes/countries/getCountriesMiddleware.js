import { Country } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, countries) => {
    res.locals.setResponse(err, { countries });
    next();
    return null;
  };

  Country.findAll({ where: payload, })
    .then(countries => done(null, countries))
    .catch(done);
};
