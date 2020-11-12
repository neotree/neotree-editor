import { firebaseAdmin } from '../index';
import { User } from '../../database/models';

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
          adminUser = await firebaseAdmin.auth().createUser({
            email: process.env.DEFAULT_ADMIN_USER_EMAIL_ADDRESS,
            password: process.env.DEFAULT_ADMIN_USER_PASSWORD,
          });
          authUsers.push(adminUser);
        } catch (e) { return reject(e); }
      }
    }

    let countUsers = 0;
    try { countUsers = await User.count({ where: {} }); } catch (e) { /* Do nothing */ }

    if (!countUsers) {
      let users = {};
      try {
        users = await new Promise(resolve => {
          firebaseAdmin.database().ref('users').once('value', snap => resolve(snap.val()));
        });
        users = users || {};
      } catch (e) { return reject(e); }

      let seedUsers = [];
      try {
        seedUsers = authUsers
          .map(u => ({
            email: u.email,
            id: u.uid,
            userId: u.uid,
            hospitals: [],
            countries: [],
            activated: false,
          }));
        await Promise.all(seedUsers.map(u => firebaseAdmin.database().ref(`users/${u.userId}`).set({ ...u, ...users[u.id] })));
      } catch (e) { return reject(e); }

      try {
        await Promise.all(seedUsers.map(u => User.findOrCreate({
          where: { email: u.email },
          defaults: {
            user_id: u.userId,
            email: u.email,
            data: JSON.stringify(u),
          },
        })));
      } catch (e) { return reject(e); }
    }

    resolve();
  })();
});
