import { Screen, Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const payload = JSON.parse(req.query.payload || {});

  const done = (err, screens, diagnoses) => {
    res.locals.setResponse(err, { screens, diagnoses });
    next(); return null;
  };

  Promise.all([
    Screen.findAll({ where: payload }),
    Diagnosis.findAll({ where: payload })
  ]).catch(done)
    .then(([screens, diagnoses]) => done(null, screens, diagnoses));
};
