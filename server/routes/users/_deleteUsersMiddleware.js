import firebase from '../../firebase';

const deleteUser = userId => new Promise((resolve, reject) => {
  (async () => {
    if (!userId) return reject(new Error('Required user "id" is not provided.'));

    let user = null;
    try {
      user = await new Promise((resolve) => {
        firebase.database().ref(`users/${userId}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { /* Do nothing */ }

    if (!user) return reject('User not found');

    try { await firebase.auth().deleteUser(userId); } catch (e) { return reject(e); }

    try { await firebase.database().ref(`users/${userId}`).remove(); } catch (e) { return reject(e); }

    resolve(user);
  })();
});

module.exports = () => (req, res, next) => {
  (async () => {
    const { users } = req.body;

    const done = (err, deletedUsers) => {
      res.locals.setResponse(err, { deletedUsers });
      next();
    };

    let deletedUsers = [];
    try { deletedUsers = await Promise.all(users.map(u => deleteUser(u.userId))); } catch (e) { return done(e); }

    done(null, deletedUsers);
  })();
};
