import { Country } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, country) => {
    res.locals.setResponse(err, { country });
    next();
    return null;
  };

  Country.findOne({ where: payload })
    .then((country) => done(null, country))
    .catch(done);
};
