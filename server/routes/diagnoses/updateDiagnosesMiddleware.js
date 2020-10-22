import { updateDiagnosis } from './updateDiagnosisMiddleware';

module.exports = (app) => (req, res, next) => {
  (async () => {
    const { diagnoses } = req.body;

    const done = (err, updatedDiagnoses) => {
      if (!err) app.io.emit('update_diagnoses', { key: app.getRandomString(), diagnoses: diagnoses.map(s => ({ diagnosisId: s.diagnosisId, scriptId: s.scriptId, })) });
      res.locals.setResponse(err, { updatedDiagnoses });
      next();
    };

    let updatedDiagnoses = [];
    try { updatedDiagnoses = await Promise.all(diagnoses.map(s => updateDiagnosis(s))); } catch (e) { return done(e); }

    done(null, updatedDiagnoses);
  })();
};
