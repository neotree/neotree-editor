import { Script, Screen, Diagnosis } from '../../models';

module.exports = (app) => (req, res, next) => {
  const {
    id,
    deleteAssociatedData,
    ...payload // eslint-disable-line
  } = req.body;

  const done = (err, script) => {
    if (!err) app.io.emit('delete_scripts', { scripts: [{ id }] });
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required script "id" is not provided.' });

  Script.findOne({ where: { id } })
    .then(s => {
      if (!s) return done({ msg: `Could not find script with "id" ${id}.` });

      s.destroy({ id })
        .then(scripts => {
          if (deleteAssociatedData === false) return done(null, { scripts });

          Promise.all([
            Screen.destroy({ where: { script_id: id } }),
            Diagnosis.destroy({ where: { script_id: id } })
          ]).then(associated => done(null, { scripts, associated }))
            .catch(err => done(null, { scripts, associatedErrors: err }));

          return null;
        })
        .catch(done);

      return null;
    })
    .catch(done);
};
