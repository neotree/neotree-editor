import { Diagnosis } from '../../database';

module.exports = () => (req, res, next) => {
  const { scriptId } = req.query;

  (async () => {
    const done = (err, diagnoses) => {
      res.locals.setResponse(err, { diagnoses });
      next();
    };

    let diagnoses = [];
    try {
      diagnoses = await Diagnosis.findAll({ where: { script_id: scriptId, deletedAt: null }, order: [['position', 'ASC']], });
      diagnoses = diagnoses.map(diagnosis => {
        const { data, ...s } = JSON.parse(JSON.stringify(diagnosis));
        return { ...data, ...s };
      });
    } catch (e) { return done(e); }

    done(null, diagnoses);
  })();
};
