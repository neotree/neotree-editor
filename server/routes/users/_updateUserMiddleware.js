import firebase from '../../firebase';
import { User } from '../../database';

module.exports = () => (req, res, next) => {
  const { userId, ...payload } = req.body;

  const done = (err, user) => {
    res.locals.setResponse(err, { user });
    next();
  };

  if (!userId) return done({ msg: 'Required user "id" is not provided.' });

  (async () => {
    let user = null;
    try {
      user = await new Promise((resolve) => {
        firebase.database().ref(`users/${userId}`)
          .on('value', snap => resolve(snap.val()));
      });
    } catch (e) { /* Do nothing */ }

    if (!user) return done('User not found');

    user = { ...user, ...payload };

    try { await firebase.database().ref(`users/${userId}`).set(user); } catch (e) { return done(e); }

    try {
      await User.update({ data: JSON.stringify(user), }, { where: { email: user.email }, });
    } catch (e) { /* Do nothing*/ }

    done(null, user);
  })();
};
