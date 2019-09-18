import * as admin from 'firebase-admin';

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

export { admin };
