import { Hospital } from '../../database';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, hospital) => {
    res.locals.setResponse(err, { hospital });
    next();
    return null;
  };

  Hospital.findOne({ where: payload })
    .then((hospital) => done(null, hospital))
    .catch(done);
};
