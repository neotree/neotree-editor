import { Diagnosis } from '../../database/models';

module.exports = () => (req, res, next) => {
  (async () => {
    const { diagnoses: _diagnoses, } = req.body;

    const done = (err, rslts = []) => {
      res.locals.setResponse(err, { diagnoses: rslts });
      next();
    };

    let rslts = null;
    const deletedAt = new Date();

    let diagnoses = [];
    try {
      diagnoses = await Diagnosis.findAll({ where: { id: _diagnoses.map(s => s.id) } });
    } catch (e) { return done(e); }

    try {
      rslts = await Diagnosis.update({ deletedAt }, { where: { id: _diagnoses.map(s => s.id) } });

      const scriptIds = diagnoses.map(s => s.script_id).reduce((acc, scriptId) => {
        if (acc.includes(scriptId)) return acc;
        return [...acc, scriptId];
      }, []);

      await Promise.all(scriptIds.map(script_id => new Promise(resolve => {
        (async () => {
          try {
            const activeDiagnoses = await Diagnosis.findAll({ where: { script_id, deletedAt: null }, order: [['position', 'ASC']] });
            await Promise.all(activeDiagnoses.map((s, i) => Diagnosis.update({ position: i + 1, }, { where: { id: s.id } })));

            const deletedDiagnoses = await Diagnosis.findAll({ where: { script_id, deletedAt: { $not: null } }, order: [['position', 'ASC']] });
            await Promise.all(deletedDiagnoses.map((s, i) => Diagnosis.update({ position: activeDiagnoses.length + i + 1, }, { where: { id: s.id } })));
          } catch (e) { /* Do nothing */ }

          resolve();
        })();
      })));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
