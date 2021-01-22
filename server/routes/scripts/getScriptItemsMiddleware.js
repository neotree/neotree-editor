import { Screen, Diagnosis } from '../../database';

module.exports = () => (req, res, next) => {
  (async () => {
    const { scriptId } = req.query;

    const done = (err, data) => {
      res.locals.setResponse(err, { ...data });
      next();
    };

    let screens = [];
    try {
      screens = await Screen.findAll({ where: { script_id: scriptId } });
    } catch (e) { /* Do nothing */ }

    let diagnoses = [];
    try {
      diagnoses = await Diagnosis.findAll({ where: { script_id: scriptId } });
    } catch (e) { /* Do nothing */ }

    done(null, { screens, diagnoses });
  })();
};
