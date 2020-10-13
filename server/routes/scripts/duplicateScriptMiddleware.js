import firebase from '../../database/firebase';
import { Script, Screen, Diagnosis } from '../../database';
import { copyScreen } from '../screens/duplicateScreenMiddleware';
import { copyDiagnosis } from '../diagnoses/duplicateDiagnosisMiddleware';

export const copyScript = ({ screens, diagnoses, ...script }) => {
  return new Promise((resolve, reject) => {
    firebase.database().ref('scripts').push().then(snap => {
      const { data, ...rest } = script;

      const scriptId = snap.key;

      firebase.database()
        .ref(`scripts/${scriptId}`).set({
          ...rest,
          ...data,
          scriptId,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => {
          Script.create({
            ...script,
            id: scriptId,
            data: JSON.stringify(script.data),
          })
            .then(script => {
              Promise.all([
                ...screens.map(screen => {
                  screen = screen.toJSON();
                  return copyScreen({
                    ...screen,
                    script_id: script.id,
                  });
                }),
                ...diagnoses.map(d => {
                  d = d.toJSON();
                  return copyDiagnosis({
                    ...d,
                    script_id: script.id,
                  });
                })
              ])
                .then(([screens, diagnoses]) => resolve({ script, screens, diagnoses }))
                .catch(error => resolve({ script, screens: [], diagnoses: [], error }));

              return null;
            })
            .catch(err => reject(err));
        })
        .catch(reject);
    })
    .catch(reject);
  });
};

export default (app) => (req, res, next) => {
  const { id } = req.body;

  const done = (err, script) => {
    if (script) app.io.emit('create_scripts', { key: app.getRandomString(), scripts: [{ id: script.id }] });
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

      copyScript({ screens, diagnoses, ...s })
        .then(({ script }) => done(null, script))
        .catch(done);

      return null;
    })
    .catch(done);
};
