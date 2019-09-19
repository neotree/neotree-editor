import * as admin from 'firebase-admin';
import { ConfigKey, Screen, Script, Diagnosis } from './models';

const serviceAccount = require(process.env.NEOTREE_FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

export const update = (refKey, child, data = {}) => {
  const db = admin.database();
  const ref = db.ref(refKey).child(child);
  ref.update(data);
};

export const set = (refKey, child, data = {}) => {
  const db = admin.database();
  const ref = db.ref(refKey).child(child);
  ref.set(data);
};

export const sync = () => {
  Promise.all([
    ConfigKey.findAll({}),
    Script.findAll({}),
    Screen.findAll({}),
    Diagnosis.findAll({})
  ]).then(([cKeys, scripts, screens, diagnoses]) => {
    const promises = [];
    cKeys.forEach(item => promises.push(ConfigKey.update({ updatedAt: new Date() }, { where: { id: item.id }, individualHooks: true })));
    scripts.forEach(item => promises.push(Script.update({ updatedAt: new Date() }, { where: { id: item.id }, individualHooks: true })));
    screens.forEach(item => promises.push(Screen.update({ updatedAt: new Date() }, { where: { id: item.id }, individualHooks: true })));
    diagnoses.forEach(item => promises.push(Diagnosis.update({ updatedAt: new Date() }, { where: { id: item.id }, individualHooks: true })));

    Promise.all(promises);
  });
};

export { admin };
