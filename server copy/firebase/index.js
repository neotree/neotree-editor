import * as admin from 'firebase-admin';
import config from '../../config/server';

const serviceAccount = config.firebaseConfig;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

export default admin;
