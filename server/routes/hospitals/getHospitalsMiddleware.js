import { Hospital } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, hospitals) => {
    res.locals.setResponse(err, { hospitals });
    next();
    return null;
  };

  Hospital.findAll({ where: payload, })
    .then(hospitals => done(null, hospitals))
    .catch(done);
};
