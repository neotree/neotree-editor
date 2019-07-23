import uuid from 'uuidv4';
import { Diagnosis } from '../../models';

export const copyDiagnosis = (req, diagnosis) => {
  const author = (req.user || {}).id || null;

  return new Promise((resolve, reject) => {
    Diagnosis.create({
      ...diagnosis,
      id: uuid(),
      author,
      data: JSON.stringify(diagnosis.data),
      details: JSON.stringify({
        original_config_key_id: diagnosis.id,
        original_host: `${req.protocol}://${req.headers.host}`
      })
    })
      .then(diagnosis => resolve(diagnosis))
      .catch(err => reject(err));
  });
};

export default () => (req, res, next) => {
  const { id } = req.body;

  const done = (err, diagnosis) => {
    res.locals.setResponse(err, { diagnosis });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required diagnosis "id" is not provided.' });

  Promise.all([
    Diagnosis.findOne({ where: { id } }),
  ])
    .then(([diagnosis]) => {
      if (!diagnosis) return done({ msg: `Could not find diagnosis with "id" ${id}.` });

      diagnosis = diagnosis.toJSON();

      copyDiagnosis(req, diagnosis)
        .then(diagnosis => done(null, diagnosis))
        .catch(done);

      return null;
    })
    .catch(done);
};
