import * as admin from 'firebase-admin';

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

export { admin };

export default admin;
