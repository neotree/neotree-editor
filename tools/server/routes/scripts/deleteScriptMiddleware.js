import { Script, Screen, Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const {
    id,
    deleteAssociatedData,
    ...payload
  } = req.body;

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next();
  };

  if (!id) return done({ msg: 'Required script "id" is not provided.' });

  Script.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find script with "id" ${id}.` });

      s.update(payload)
        .then(scripts => {
          if (deleteAssociatedData === false) return done(null, { scripts });

          Promise.all([
            Screen.destroy({ where: { script_id: id } }),
            Diagnosis.destroy({ where: { script_id: id } })
          ]).then(associated => done(null, { scripts, associated }))
            .catch(err => done(null, { scripts, associatedErrors: err }));
        })
        .catch(done);
    })
    .catch(done);
};
