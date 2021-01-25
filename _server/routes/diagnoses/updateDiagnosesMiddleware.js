import { updateDiagnosis } from './updateDiagnosisMiddleware';

module.exports = () => (req, res, next) => {
  (async () => {
    const { diagnoses } = req.body;

    const done = (err, updatedDiagnoses) => {
      if (err) {
        res.locals.setResponse(err);
        return next();
      }
      res.locals.setResponse(null, { updatedDiagnoses });
      next();
    };

    let updatedDiagnoses = [];
    try { updatedDiagnoses = await Promise.all(diagnoses.map(s => updateDiagnosis(s))); } catch (e) { return done(e); }

    done(null, updatedDiagnoses);
  })();
};
