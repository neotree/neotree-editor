import firebase from '../../firebase';
import { Script, Screen, Diagnosis, ConfigKey } from '../../models';

module.exports = () => (req, res, next) => {
  const done = (err, rslts) => {
    res.locals.setResponse(err, rslts);
    next(); return null;
  };

  Promise.all([
    Script.findAll({ where: {} }),
    Screen.findAll({ where: {} }),
    Diagnosis.findAll({ where: {} }),
    ConfigKey.findAll({ where: {} })
  ]).then(([scripts, screens, diagnoses, configKeys]) => {
    scripts = JSON.parse(JSON.stringify(scripts));
    screens = JSON.parse(JSON.stringify(screens));
    diagnoses = JSON.parse(JSON.stringify(diagnoses));
    configKeys = JSON.parse(JSON.stringify(diagnoses));

    Promise.all([
      ...scripts.map(({ id: scriptId, ...s }) => firebase
        .database()
        .ref(`scripts/${scriptId}`)
        .set({
          ...s.data,
          scriptId,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        })),

      ...screens.map(({ id, ...s }) => firebase
        .database()
        .ref(`screens/${s.screen_id}`)
        .set({
          ...s.data,
          screenId: s.screen_id,
          scriptId: s.script_id,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        })),

      ...diagnoses.map(({ id, ...s }) => firebase
        .database()
        .ref(`diagnosis/${s.diagnosis_id}`)
        .set({
          ...s.data,
          diagnosisId: s.diagnosis_id,
          scriptId: s.script_id,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        })),

      ...configKeys.map(({ id: configKeyId, ...s }) => firebase
        .database()
        .ref(`configkeys/${configKeyId}`)
        .set({
          ...s.data,
          configKeyId,
          createdAt: firebase.database.ServerValue.TIMESTAMP
        })),
    ]).then(() => {
      done(null, { success: true });
    }).catch(done);
  }).catch(done);
};
