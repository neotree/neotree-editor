import uuid from 'uuidv4';
import { Script, Screen, Diagnosis } from '../../models';

module.exports = () => (req, res, next) => {
  const { id } = req.body;

  const done = (err, script) => {
    res.locals.setResponse(err, { script });
    next(); return null;
  };

  if (!id) return done({ msg: 'Required script "id" is not provided.' });

  Promise.all([
    Script.findOne({ where: { id } }),
    Screen.findAll({ where: { script_id: id } }),
    Diagnosis.findAll({ where: { script_id: id } })
  ])
    .then(([s, screens, diagnoses]) => {
      if (!s) return done({ msg: `Could not find script with "id" ${id}.` });

      s = s.toJSON();

      Script.create({
        ...s,
        id: uuid(),
        data: JSON.stringify(s.data),
        details: JSON.stringify({
          original_script_id: id,
          original_host: `${req.protocol}://${req.headers.host}`
        })
      })
        .then(script => {
          Promise.all([
            ...screens.map(screen => {
              screen = screen.toJSON();
              return Screen.create({
                ...screen,
                id: uuid(),
                script_id: script.id,
                data: JSON.stringify(screen.data),
                details: JSON.stringify({
                  original_script_id: id,
                  original_screen_id: screen.id,
                  original_host: `${req.protocol}://${req.headers.host}`
                })
              });
            }),
            ...diagnoses.map(d => {
              d = d.toJSON();
              return Diagnosis.create({
                ...d,
                id: uuid(),
                script_id: script.id,
                data: JSON.stringify(d.data),
                details: JSON.stringify({
                  original_script_id: id,
                  original_diagnosis_id: d.id,
                  original_host: `${req.protocol}://${req.headers.host}`
                })
              });
            })
          ])
            .then(() => done(null, script))
            .catch(() => done(null, script));

          return null;
        })
        .catch(done);

      return null;
    })
    .catch(done);
};
