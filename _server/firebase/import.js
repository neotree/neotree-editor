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
    Object.keys(configKeys).forEach(id => promises.push(
      ConfigKey.findOrCreate({
        where: { id },
        defaults: { data: JSON.stringify(configKeys[id]) }
      })
    ));

    Object.keys(scripts).forEach(id => promises.push(
      Script.findOrCreate({
        where: { id },
        defaults: { data: JSON.stringify(scripts[id]) }
      })
    ));

    Object.keys(screens).forEach(script_id => {
      Object.keys(screens[script_id]).forEach((id, position) => {
        position = position + 1;
        promises.push(Screen.findOrCreate({
          where: { id },
          defaults: {
            script_id,
            position,
            type: screens[script_id][id].type,
            data: JSON.stringify(screens[script_id][id])
          }
        }));
      });
    });

    Object.keys(diagnosis).forEach(script_id => {
      Object.keys(diagnosis[script_id]).forEach((id) => {
        promises.push(Diagnosis.findOrCreate({
          where: { id },
          defaults: { script_id, data: JSON.stringify(diagnosis[script_id][id]) }
        }));
      });
    });

    Promise.all(promises)
      .then(resolve)
      .catch(reject);
  });
});
