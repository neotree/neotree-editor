import { Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const { id } = req.body;

  const done = (err, diagnosis) => {
    res.locals.setResponse(err, { diagnosis });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required diagnosis "id" is not provided.' });

  Diagnosis.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find script with "id" ${id}.` });

      s.destroy({ where: { id } })
        .then(deleted => done(null, { deleted }))
        .catch(done);

      return null;
    })
    .catch(done);
};
