import firebase, { firebaseAdmin } from '../index';

export default () => new Promise((resolve, reject) => {
  (async () => {
    let authUsers = [];
    try {
      const rslts = await firebaseAdmin.auth().listUsers();
      authUsers = rslts.users || [];
    } catch (e) { return reject(e); }

    if (process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS) {
      let adminUser = authUsers.filter(u => u.email === process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS)[0];
      if (!adminUser) {
        try {
          adminUser = await firebase.auth().createUser({
            email: process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS,
            password: process.env.DEFAULT_ADMIN_USER_PASSWORD,
          });
          authUsers.push(adminUser);
        } catch (e) { return reject(e); }
      }
    }

    let users = {};
    try {
      users = await firebaseAdmin.database().ref('users');
      users = users || {};
    } catch (e) { return reject(e); }

    try {
      const seedUsers = authUsers.filter(u => !users[u.uid]);
      await Promise.all(seedUsers.map(u => firebaseAdmin.database().ref(`users/${u.uid}`).set({
        email: u.email,
        id: u.uid,
        userId: u.uid,
        hospitals: [],
        countries: [],
        activated: false,
      })));
    } catch (e) { return reject(e); }

    resolve();
  })();
});
