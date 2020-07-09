import { Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.query;

  const done = (err, diagnosis) => {
    res.locals.setResponse(err, { diagnosis });
    next(); return null;
  };

  Diagnosis.findOne({ where: payload })
    .then((diagnosis) => done(null, diagnosis))
    .catch(done);
};
