import { Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  const done = (err, diagnosis) => {
    res.locals.setResponse(err, { diagnosis });
    next();
  };

  Diagnosis.findOne({ where: payload })
    .then((diagnosis) => done(null, diagnosis))
    .catch(done);
};
