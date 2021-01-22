import { Diagnosis } from '../../database/models';

export const updateDiagnosis = ({ id, ...payload }) => new Promise((resolve, reject) => {
  (async () => {
    if (!id) return reject(new Error('Required diagnosis "id" is not provided.'));

    let diagnosis = null;
    try {
      diagnosis = await Diagnosis.findOne({ where: { id } });
    } catch (e) { return reject(e); }

    if (!diagnosis) return reject(new Error(`Diagnosis with id "${id}" not found`));

    try {
      await Diagnosis.update(
        {
          position: payload.position || diagnosis.position,
          data: JSON.stringify({ ...diagnosis.data, ...payload }),
        },
        { where: { id } }
      );
    } catch (e) { /* Do nothing */ }

    resolve(diagnosis);
  })();
});

export default () => (req, res, next) => {
  (async () => {
    const done = (err, diagnosis) => {
      res.locals.setResponse(err, { diagnosis });
      next();
    };

    let diagnosis = null;
    try { diagnosis = await updateDiagnosis(req.body); } catch (e) { return done(e); }

    done(null, diagnosis);
  })();
};
