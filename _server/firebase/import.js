import firebase from '../firebase';
import { ConfigKey, Script, Screen, Diagnosis } from '../models';

export default () => new Promise((resolve, reject) => {
  const db = firebase.database();

  const promises = [];

  const getData = (collection) => new Promise(resolve => db.ref(collection)
    .on('value', snap => resolve(snap.val())));

  Promise.all([
    getData('configkeys'),
    getData('scripts'),
    getData('screens'),
    getData('diagnosis')
  ]).then(([configKeys, scripts, screens, diagnosis]) => {
    Object.keys(configKeys).forEach((config_key_id, i) => {
      const position = configKeys[config_key_id].position || (i + 1);
      promises.push(
        ConfigKey.findOrCreate({
          where: { config_key_id },
          defaults: { id: config_key_id, position, config_key_id, data: JSON.stringify(configKeys[config_key_id]) }
        })
      );
    });

    Object.keys(scripts).forEach((script_id, i) => {
      const position = scripts[script_id].position || (i + 1);
      promises.push(
        Script.findOrCreate({
          where: { script_id },
          defaults: { id: script_id, position, script_id, data: JSON.stringify(scripts[script_id]) }
        })
      );

      Object.keys(screens[script_id] || {}).forEach((screen_id, position) => {
        const s = screens[script_id][screen_id];
        position = position + 1;
        promises.push(Screen.findOrCreate({
          where: { screen_id, script_id },
          defaults: {
            script_id,
            screen_id,
            position: s.position || position,
            type: s.type,
            data: JSON.stringify(s)
          }
        }));
      });

      Object.keys(diagnosis[script_id] || {}).forEach((diagnosis_id, position) => {
        const d = diagnosis[script_id][diagnosis_id];
        position = position + 1;
        promises.push(Diagnosis.findOrCreate({
          where: { diagnosis_id, script_id },
          defaults: {
            script_id,
            diagnosis_id,
            position: d.position || position,
            data: JSON.stringify(d)
          }
        }));
      });
    });

    Promise.all(promises)
      .then(resolve)
      .catch(reject);
  });
});