import firebase from '../../firebase';
import { ConfigKey, Diagnosis, Screen } from '../../database/models';

export const copyConfigKey = ({ id }) => {
  return new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Required configKey "id" is not provided.'));

    (async () => {
      let configKeyId = null;
      try {
        const snap = await firebase.database().ref('configKeys').push();
        configKeyId = snap.key;
      } catch (e) { return reject(e); }

      let configKey = null;
      try {
        configKey = await ConfigKey.findOne({ where: { id } });
      } catch (e) { /* Do nothing */ }

      if (!configKey) return reject(new Error(`ConfigKey with id "${id}" not found`));

      configKey = JSON.parse(JSON.stringify(configKey));

      let configKeysCount = 0;
      try {
        configKeysCount = await ConfigKey.count({ where: {} });
      } catch (e) { /* Do nothing */ }

      let screens = [];
      try {
        screens = await Screen.findAll({ where: { config_key_id: configKey.config_key_id, deletedAt: null }, order: [['position', 'ASC']] });
        const snaps = await Promise.all(screens.map(() => firebase.database().ref(`screens/${configKeyId}`).push()));
        screens = screens.map((s, i) => {
          s = JSON.parse(JSON.stringify(s));
          delete s.id;
          return {
            ...s,
            config_key_id: configKeyId,
            screen_id: snaps[i].key,
            data: JSON.stringify({
              ...s.data,
              configKeyId,
              screenId: snaps[i].key,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
            }),
          };
        });
      } catch (e) { /* Do nothing */ }

      let diagnoses = [];
      try {
        diagnoses = await Diagnosis.findAll({ where: { config_key_id: configKey.config_key_id, deletedAt: null }, order: [['position', 'ASC']] });
        const snaps = await Promise.all(diagnoses.map(() => firebase.database().ref(`diagnosis/${configKeyId}`).push()));
        diagnoses = diagnoses.map((d, i) => {
          d = JSON.parse(JSON.stringify(d));
          delete d.id;
          return {
            ...d,
            config_key_id: configKeyId,
            diagnosis_id: snaps[i].key,
            data: JSON.stringify({
              ...d.data,
              configKeyId,
              diagnosisId: snaps[i].key,
              createdAt: firebase.database.ServerValue.TIMESTAMP,
              updatedAt: firebase.database.ServerValue.TIMESTAMP,
            }),
          };
        });
      } catch (e) { /* Do nothing */ }

      delete configKey.id;
      configKey = {
        ...configKey,
        config_key_id: configKeyId,
        position: configKeysCount + 1,
        data: JSON.stringify({
          ...configKey.data,
          configKeyId,
          position: configKeysCount + 1,
          createdAt: firebase.database.ServerValue.TIMESTAMP,
          updatedAt: firebase.database.ServerValue.TIMESTAMP,
        }),
      };

      let savedConfigKey = null;
      try {
        savedConfigKey = await ConfigKey.findOrCreate({ where: { config_key_id: configKey.config_key_id }, defaults: { ...configKey } });
      } catch (e) { return reject(e); }

      let savedScreens = [];
      try {
        savedScreens = await Promise.all(screens.map(s => Screen.findOrCreate({ where: { screen_id: s.screen_id }, defaults: { ...s } })));
      } catch (e) { /* Do nothing */ }

      let savedDiagnoses = [];
      try {
        savedDiagnoses = await Promise.all(diagnoses.map(d => Diagnosis.findOrCreate({ where: { diagnosis_id: d.diagnosis_id }, defaults: { ...d } })));
      } catch (e) { /* Do nothing */ }

      resolve({
        configKey: savedConfigKey,
        diagnoses: savedScreens,
        screens: savedDiagnoses,
      });
    })();
  });
};

export default () => (req, res, next) => {
  (async () => {
    const { configKeys } = req.body;

    const done = async (err, rslts = []) => {
      res.locals.setResponse(err, { configKeys: rslts.map(({ configKey }) => configKey) });
      next();
    };

    let rslts = [];
    try {
      rslts = await Promise.all(configKeys.map(s => copyConfigKey(s)));
    } catch (e) { return done(e); }

    done(null, rslts);
  })();
};
