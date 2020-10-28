import { Diagnosis, Log } from '../../models';
import { findAndUpdateDiagnoses } from './updateDiagnosesMiddleware';

module.exports = app => (req, res, next) => {
  const { id } = req.body;

  const done = (err, deleted) => {
    if (deleted) {
      app.io.emit('delete_diagnoses', { diagnoses: [{ diagnosisId: deleted.diagnosis_id }] });
      Log.create({
        name: 'delete_diagnoses',
        data: JSON.stringify({ diagnoses: [{ diagnosisId: deleted.diagnosis_id }] })
      });
    }
    res.locals.setResponse(err, { deleted });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required diagnosis "id" is not provided.' });

  Diagnosis.findOne({ where: { id } })
    .then(d => {
      if (!d) return done({ msg: `Could not find script with "id" ${id}.` });

      d.destroy({ where: { id } })
        .then(() => {
          // update diagnoses positions
          findAndUpdateDiagnoses(
            {
              attributes: ['id'],
              where: { script_id: d.script_id },
              order: [['position', 'ASC']]
            },
            diagnoses => diagnoses.map((d, i) => ({ ...d, position: i + 1 }))
          ).then(() => null).catch(err => { app.logger.log(err); return null; });

          return done(null, d);
        })
        .catch(done);

      return null;
    })
    .catch(done);
};
