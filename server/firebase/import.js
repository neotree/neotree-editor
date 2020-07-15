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
    const sortData = (arr = []) => arr.sort((a, b) => a - b);

    configKeys = sortData(Object.keys(configKeys).map((id) => ({ 
      id,
      ...configKeys[id], 
    })));

    scripts = sortData(Object.keys(scripts).map((script_id) => ({ 
      script_id,
      ...scripts[script_id], 
    })));    

    configKeys.forEach(({ id, ...key }, i) => promises.push(
      ConfigKey.findOrCreate({
        where: { id },
        defaults: { position: i + 1, data: JSON.stringify(key) }
      })
    ));

    scripts.forEach(({ script_id, ...script }, i) => {
      screens = sortData(Object.keys(screens[script_id] || {}).map((screen_id) => ({ 
        screen_id,
        ...screens[script_id][screen_id], 
      })));

      diagnosis = sortData(Object.keys(diagnosis[script_id] || {}).map((diagnosis_id) => ({ 
        diagnosis_id,
        ...diagnosis[script_id][diagnosis_id], 
      })));

      promises.push(
        Script.findOrCreate({
          where: { id: script_id },
          defaults: { position: i + 1, data: JSON.stringify(script) }
        })
      );

      screens.forEach(({ screen_id, ...s }, position) => {
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

      diagnosis.forEach(({ diagnosis_id, ...d }, position) => {
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
