import * as admin from 'firebase-admin';
import { ConfigKey, Screen, Script, Diagnosis } from './models';

const serviceAccountKeySource = process.env.NEOTREE_FIREBASE_SERVICE_ACCOUNT_KEY || '../_config/firebase-service-account-key.json';

const serviceAccount = require(serviceAccountKeySource);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

export const set = (collection, key, data) => admin.database()
  .ref(collection).child(key).set(data);

export const update = (collection, key, data) => admin.database()
  .ref(collection).child(key).update(data);

export const remove = (collection, child) => admin.database()
  .ref(collection).child(child).remove();

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
