import 'firebase/auth';
import * as firebase from 'firebase';
import * as firebaseAdmin from 'firebase-admin';

const getParsedValue = v => JSON.parse(`"${v || ''}"`);

const firebaseOptions = JSON.parse(JSON.stringify({
  apiKey: getParsedValue(process.env.firebaseSDK_apiKey),
  authDomain: getParsedValue(process.env.firebaseSDK_authDomain),
  databaseURL: getParsedValue(process.env.firebaseSDK_databaseURL),
  projectId: getParsedValue(process.env.firebaseSDK_projectId),
  storageBucket: getParsedValue(process.env.firebaseSDK_storageBucket),
  messagingSenderId: getParsedValue(process.env.firebaseSDK_messagingSenderId),
  appId: getParsedValue(process.env.firebaseSDK_appId),
  measurementId: getParsedValue(process.env.firebaseSDK_measurementId),
}));

firebase.initializeApp(firebaseOptions);

const firebaseAdminOptions = JSON.parse(JSON.stringify({
  type: getParsedValue(process.env.firebaseAdminSDK_type),
  project_id: getParsedValue(process.env.firebaseAdminSDK_project_id),
  private_key_id: getParsedValue(process.env.firebaseAdminSDK_private_key_id),
  private_key: getParsedValue(process.env.firebaseAdminSDK_private_key),
  client_email: getParsedValue(process.env.firebaseAdminSDK_client_email),
  client_id: getParsedValue(process.env.firebaseAdminSDK_client_id),
  auth_uri: getParsedValue(process.env.firebaseAdminSDK_auth_uri),
  token_uri: getParsedValue(process.env.firebaseAdminSDK_token_uri),
  auth_provider_x509_cert_url: getParsedValue(process.env.firebaseAdminSDK_auth_provider_x509_cert_url),
  client_x509_cert_url: getParsedValue(process.env.firebaseAdminSDK_client_x509_cert_url),
}));

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseAdminOptions),
  databaseURL: `https://${process.env.firebaseAdminSDK_project_id}.firebaseio.com`
});

export { firebase, firebaseAdmin, firebaseAdminOptions, firebaseOptions, };

export default firebaseAdmin;
