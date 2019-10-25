import uuid from 'uuidv4';
import { Script, Screen, Diagnosis } from '../../models';

export const copyScript = (req, { screens, diagnoses, ...script }) => {
  return new Promise((resolve, reject) => {
    Script.create({
      ...script,
      id: uuid(),
      data: JSON.stringify(script.data),
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
            });
          }),
          ...diagnoses.map(d => {
            d = d.toJSON();
            return Diagnosis.create({
              ...d,
              id: uuid(),
              script_id: script.id,
              data: JSON.stringify(d.data),
            });
          })
        ])
          .then(([screens, diagnoses]) => resolve({ script, screens, diagnoses }))
          .catch(error => resolve({ script, screens: [], diagnoses: [], error }));

        return null;
      })
      .catch(err => reject(err));
  });
};

export default () => (req, res, next) => {
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

      copyScript(req, { screens, diagnoses, ...s })
        .then(({ script }) => done(null, script))
        .catch(done);

      return null;
    })
    .catch(done);
};
