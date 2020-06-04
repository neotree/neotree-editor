import { Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || '{}');

  const done = (err, diagnoses) => {
    res.locals.setResponse(err, { diagnoses });
    next(); return null;
  };

  Diagnosis.findAll({ where: payload, order: [['position', 'ASC']] })
    .then(diagnoses => done(null, diagnoses))
    .catch(done);
};
