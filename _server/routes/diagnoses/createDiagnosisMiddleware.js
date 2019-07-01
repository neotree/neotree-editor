import { Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = req.body;

  const done = (err, diagnosis) => {
    res.locals.setResponse(err, { diagnosis });
    next();
  };

  Diagnosis.create(payload)
    .then((diagnosis) => done(null, diagnosis))
    .catch(done);
};
