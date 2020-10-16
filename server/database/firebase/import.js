import firebase from '../firebase';
import { ConfigKey, Script, Screen, Diagnosis, Hospital, UserCountry, UserHospital } from '../index';

export default () => new Promise((resolve, reject) => {
  const db = firebase.database();

  const promises = [];

  const getData = (collection) => new Promise(resolve => db.ref(collection)
    .on('value', snap => resolve(snap.val())));

  Promise.all([
    getData('configkeys'),
    getData('scripts'),
    getData('screens'),
    getData('diagnosis'),
    getData('hospitals'),
    getData('user_hospitals'),
    getData('user_countries')
  ]).then(([_configKeys, _scripts, _screens, _diagnosis, _hospitals, _userHospitals, _userCountries]) => {
    const sortData = (arr = []) => arr.sort((a, b) => a.position - b.position);

    const configKeys = sortData(Object.keys(_configKeys || {}).map((config_key_id) => ({
      ..._configKeys[config_key_id],
      config_key_id,
    })));

    const scripts = sortData(Object.keys(_scripts || {}).map((script_id) => ({
      ..._scripts[script_id],
      script_id,
    })));

    Object.keys(_hospitals || {}).forEach(hospital_id => promises.push(
      Hospital.findOrCreate({
        where: { hospital_id },
        defaults: _hospitals[hospital_id],
      })
    ));

    Object.keys(_userHospitals || {}).forEach(user => promises.push(
      UserHospital.findOrCreate({
        where: { user },
        defaults: _userHospitals[user],
      })
    ));

    Object.keys(_userCountries || {}).forEach(user => promises.push(
      UserCountry.findOrCreate({
        where: { user },
        defaults: _userCountries[user],
      })
    ));

    configKeys.forEach(({ config_key_id, ...key }, i) => promises.push(
      ConfigKey.findOrCreate({
        where: { config_key_id },
        defaults: { position: i + 1, data: JSON.stringify(key) }
      })
    ));

    scripts.forEach(({ script_id, ...script }, i) => {
      const screens = sortData(Object.keys(_screens[script_id] || {}).map((screen_id) => ({
        ..._screens[script_id][screen_id],
        screen_id,
      })));

      const diagnosis = sortData(Object.keys(_diagnosis[script_id] || {}).map((diagnosis_id) => ({
        ..._diagnosis[script_id][diagnosis_id],
        diagnosis_id,
      })));

      promises.push(
        Script.findOrCreate({
          where: { script_id },
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
