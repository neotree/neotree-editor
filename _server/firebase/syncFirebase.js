import firebase from '../firebase';
import { ConfigKey, Script, Screen, Diagnosis } from '../models';

export default () => {
  const db = firebase.database();
  db.ref('configkeys').on('value', snap => {
    const configKeys = snap.val();

    Promise.all(Object.keys(configKeys).map(id => {
      return ConfigKey.findOrCreate({
        where: { id },
        defaults: { data: JSON.stringify(configKeys[id]) }
      });
    }));
  });

  db.ref('scripts').on('value', snap => {
    const scripts = snap.val();

    Promise.all(Object.keys(scripts).map(id => {
      return Script.findOrCreate({
        where: { id },
        defaults: { data: JSON.stringify(scripts[id]) }
      });
    }));
  });

  db.ref('screens').on('value', snap => {
    const screens = snap.val();
  });

  db.ref('diagnosis').on('value', snap => {
    const diagnoses = snap.val();
  });
};
